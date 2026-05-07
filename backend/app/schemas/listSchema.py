from pydantic import BaseModel
from uuid import UUID


class ListCreate(BaseModel):
    list_name: str
    description: str | None = None
    is_public: bool = True


class ListUpdate(BaseModel):
    list_name: str | None = None
    description: str | None = None
    is_public: bool | None = None


class ListItemCreate(BaseModel):
    game_id: UUID
