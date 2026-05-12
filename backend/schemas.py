from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


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
    is_public: bool = False
    tag_ids: List[int] = []
    new_tags: List[str] = []


class PromptUpdate(BaseModel):
    title: Optional[str] = None
    scenario: Optional[str] = None
    content: Optional[str] = None
    variables: Optional[str] = None
    is_public: Optional[bool] = None
    tag_ids: Optional[List[int]] = None
    new_tags: List[str] = []


class PromptListItem(BaseModel):
    id: int
    title: str
    scenario: Optional[str] = None
    content: str
    variables: Optional[str] = None
    user_id: Optional[int] = None
    owner_username: Optional[str] = None
    is_public: bool = False
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
    user_id: Optional[int] = None
    owner_username: Optional[str] = None
    is_public: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    tags: List[TagResponse] = []
    versions: List[PromptVersionResponse] = []

    class Config:
        from_attributes = True
