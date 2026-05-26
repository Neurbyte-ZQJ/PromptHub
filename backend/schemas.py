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


class CategoryCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None
    sort_order: int = 0


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: Optional[int] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    parent_id: Optional[int] = None
    user_id: Optional[int] = None
    sort_order: int = 0
    created_at: datetime
    children: List["CategoryResponse"] = []

    class Config:
        from_attributes = True


CategoryResponse.model_rebuild()


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
    category_ids: List[int] = []
    tag_ids: List[int] = []
    new_tags: List[str] = []


class PromptUpdate(BaseModel):
    title: Optional[str] = None
    scenario: Optional[str] = None
    content: Optional[str] = None
    variables: Optional[str] = None
    is_public: Optional[bool] = None
    category_ids: Optional[List[int]] = None
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
    categories: List[CategoryResponse] = []
    tags: List[TagResponse] = []
    favorite_count: int = 0
    is_favorited: bool = False

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
    categories: List[CategoryResponse] = []
    tags: List[TagResponse] = []
    versions: List[PromptVersionResponse] = []
    favorite_count: int = 0
    is_favorited: bool = False

    class Config:
        from_attributes = True


class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    prompt_id: int
    created_at: datetime

    class Config:
        from_attributes = True
