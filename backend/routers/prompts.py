from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Prompt, Tag
from ..schemas import PromptCreate, PromptResponse, PromptUpdate

router = APIRouter()

@router.get("/", response_model=List[PromptResponse])
def list_prompts(
    skip: int = 0,
    limit: int = 20,
    category: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Prompt)
    if category:
        query = query.filter(Prompt.category == category)
    prompts = query.offset(skip).limit(limit).all()
    return prompts

@router.post("/", response_model=PromptResponse)
def create_prompt(prompt: PromptCreate, db: Session = Depends(get_db)):
    tag_ids = list(prompt.tag_ids)
    for tag_name in prompt.new_tags:
        existing = db.query(Tag).filter(Tag.name == tag_name).first()
        if existing:
            if existing.id not in tag_ids:
                tag_ids.append(existing.id)
        else:
            new_tag = Tag(name=tag_name)
            db.add(new_tag)
            db.flush()
            tag_ids.append(new_tag.id)

    db_prompt = Prompt(
        title=prompt.title,
        scenario=prompt.scenario,
        content=prompt.content,
        variables=prompt.variables,
    )
    for tid in tag_ids:
        tag = db.query(Tag).filter(Tag.id == tid).first()
        if tag:
            db_prompt.tags.append(tag)
    db.add(db_prompt)
    db.commit()
    db.refresh(db_prompt)
    return db_prompt

@router.get("/{prompt_id}", response_model=PromptResponse)
def get_prompt(prompt_id: int, db: Session = Depends(get_db)):
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="提示词未找到")
    return prompt

@router.put("/{prompt_id}", response_model=PromptResponse)
def update_prompt(prompt_id: int, prompt_update: PromptUpdate, db: Session = Depends(get_db)):
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="提示词未找到")

    update_data = prompt_update.dict(exclude_unset=True)
    for key in ["title", "scenario", "content", "variables"]:
        if key in update_data:
            setattr(prompt, key, update_data[key])

    if "tag_ids" in update_data or prompt_update.new_tags:
        tag_ids = list(update_data.get("tag_ids", [t.id for t in prompt.tags]))
        for tag_name in prompt_update.new_tags:
            existing = db.query(Tag).filter(Tag.name == tag_name).first()
            if existing:
                if existing.id not in tag_ids:
                    tag_ids.append(existing.id)
            else:
                new_tag = Tag(name=tag_name)
                db.add(new_tag)
                db.flush()
                tag_ids.append(new_tag.id)

        prompt.tags.clear()
        for tid in tag_ids:
            tag = db.query(Tag).filter(Tag.id == tid).first()
            if tag:
                prompt.tags.append(tag)

    db.commit()
    db.refresh(prompt)
    return prompt

@router.delete("/{prompt_id}")
def delete_prompt(prompt_id: int, db: Session = Depends(get_db)):
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="提示词未找到")
    
    db.delete(prompt)
    db.commit()
    return {"message": "删除成功"}
