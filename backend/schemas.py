from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class TagBase(BaseModel):
    name: str


class TagResponse(TagBase):
    id: int

    class Config:
        from_attributes = True


class PromptVersionResponse(BaseModel):
    id: int
    prompt_id: int
    content: str
    version_number: int
    created_at: datetime

    class Config:
        from_attributes = True


class PromptCreate(BaseModel):
    title: str
    scenario: Optional[str] = None
    content: str
    variables: Optional[str] = None
    tag_ids: List[int] = []
    new_tags: List[str] = []


class PromptUpdate(BaseModel):
    title: Optional[str] = None
    scenario: Optional[str] = None
    content: Optional[str] = None
    variables: Optional[str] = None
    tag_ids: Optional[List[int]] = None
    new_tags: List[str] = []


class PromptListItem(BaseModel):
    id: int
    title: str
    scenario: Optional[str] = None
    content: str
    variables: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    tags: List[TagResponse] = []

    class Config:
        from_attributes = True


class PromptResponse(BaseModel):
    id: int
    title: str
    scenario: Optional[str] = None
    content: str
    variables: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    tags: List[TagResponse] = []
    versions: List[PromptVersionResponse] = []

    class Config:
        from_attributes = True
