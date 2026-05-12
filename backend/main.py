from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from .database import get_db, engine, Base
from .models import Prompt, Tag, PromptVersion, User, prompt_tag_association
from .schemas import (
    PromptCreate,
    PromptUpdate,
    PromptListItem,
    PromptResponse,
    TagResponse,
    UserCreate,
    LoginRequest,
    UserResponse,
    Token,
)
from .auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PromptHub API",
    description="AI 提示词资产管理库",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="用户名已存在")
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="邮箱已被注册")

    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/api/auth/login", response_model=Token)
def login(user_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token, token_type="bearer")


@app.get("/api/auth/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/api/prompts", response_model=PromptResponse)
def create_prompt(
    prompt_data: PromptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tag_ids = list(prompt_data.tag_ids)
    prompt_dict = prompt_data.model_dump(exclude={"tag_ids", "new_tags"})

    for tag_name in prompt_data.new_tags:
        existing = db.query(Tag).filter(Tag.name == tag_name).first()
        if existing:
            if existing.id not in tag_ids:
                tag_ids.append(existing.id)
        else:
            new_tag = Tag(name=tag_name)
            db.add(new_tag)
            db.flush()
            tag_ids.append(new_tag.id)

    db_prompt = Prompt(**prompt_dict, user_id=current_user.id)

    if tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        db_prompt.tags = tags

    db.add(db_prompt)
    db.flush()

    first_version = PromptVersion(
        prompt_id=db_prompt.id,
        content=db_prompt.content,
        version_number=1,
    )
    db.add(first_version)
    db.commit()
    db.refresh(db_prompt)
    return db_prompt


@app.get("/api/prompts", response_model=List[PromptListItem])
def list_prompts(
    search: Optional[str] = Query(None, description="按标题或内容搜索"),
    tag_id: Optional[int] = Query(None, description="按标签ID筛选"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Prompt).filter(
        or_(Prompt.user_id == current_user.id, Prompt.is_public == True)
    )

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (Prompt.title.ilike(pattern)) | (Prompt.content.ilike(pattern))
        )

    if tag_id is not None:
        query = query.join(prompt_tag_association).filter(
            prompt_tag_association.c.tag_id == tag_id
        )

    return query.order_by(Prompt.created_at.desc()).all()


@app.get("/api/prompts/{prompt_id}", response_model=PromptResponse)
def get_prompt(
    prompt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="提示词未找到")
    if prompt.user_id != current_user.id and not prompt.is_public:
        raise HTTPException(status_code=403, detail="无权访问该提示词")
    return prompt


@app.put("/api/prompts/{prompt_id}", response_model=PromptResponse)
def update_prompt(
    prompt_id: int,
    prompt_data: PromptUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="提示词未找到")
    if prompt.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权修改该提示词")

    update_dict = prompt_data.model_dump(exclude_unset=True)
    tag_ids = update_dict.pop("tag_ids", None)
    new_tags = update_dict.pop("new_tags", [])

    content_changed = False
    if "content" in update_dict and update_dict["content"] != prompt.content:
        content_changed = True

    for key, value in update_dict.items():
        setattr(prompt, key, value)

    if tag_ids is not None or new_tags:
        final_tag_ids = list(tag_ids) if tag_ids is not None else [t.id for t in prompt.tags]
        for tag_name in new_tags:
            existing = db.query(Tag).filter(Tag.name == tag_name).first()
            if existing:
                if existing.id not in final_tag_ids:
                    final_tag_ids.append(existing.id)
            else:
                new_tag = Tag(name=tag_name)
                db.add(new_tag)
                db.flush()
                final_tag_ids.append(new_tag.id)
        tags = db.query(Tag).filter(Tag.id.in_(final_tag_ids)).all()
        prompt.tags = tags

    if content_changed:
        latest_version = (
            db.query(PromptVersion)
            .filter(PromptVersion.prompt_id == prompt.id)
            .order_by(PromptVersion.version_number.desc())
            .first()
        )
        next_version = (latest_version.version_number + 1) if latest_version else 1
        new_version = PromptVersion(
            prompt_id=prompt.id,
            content=update_dict["content"],
            version_number=next_version,
        )
        db.add(new_version)

    db.commit()
    db.refresh(prompt)
    return prompt


@app.delete("/api/prompts/{prompt_id}")
def delete_prompt(
    prompt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="提示词未找到")
    if prompt.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权删除该提示词")

    db.delete(prompt)
    db.commit()
    return {"message": "删除成功"}


@app.get("/api/tags", response_model=List[TagResponse])
def list_tags(db: Session = Depends(get_db)):
    return db.query(Tag).order_by(Tag.name).all()
