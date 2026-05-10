from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from .database import get_db, engine, Base
from .models import Prompt, Tag, PromptVersion, prompt_tag_association
from .schemas import (
    PromptCreate,
    PromptUpdate,
    PromptListItem,
    PromptResponse,
    TagResponse,
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


@app.post("/api/prompts", response_model=PromptResponse)
def create_prompt(prompt_data: PromptCreate, db: Session = Depends(get_db)):
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

    db_prompt = Prompt(**prompt_dict)

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
):
    query = db.query(Prompt)

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
def get_prompt(prompt_id: int, db: Session = Depends(get_db)):
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="提示词未找到")
    return prompt


@app.put("/api/prompts/{prompt_id}", response_model=PromptResponse)
def update_prompt(
    prompt_id: int,
    prompt_data: PromptUpdate,
    db: Session = Depends(get_db),
):
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="提示词未找到")

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
def delete_prompt(prompt_id: int, db: Session = Depends(get_db)):
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="提示词未找到")

    db.delete(prompt)
    db.commit()
    return {"message": "删除成功"}


@app.get("/api/tags", response_model=List[TagResponse])
def list_tags(db: Session = Depends(get_db)):
    return db.query(Tag).order_by(Tag.name).all()
