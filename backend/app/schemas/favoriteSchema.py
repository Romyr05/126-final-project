from pydantic import BaseModel
from uuid import UUID


class FavoriteCreate(BaseModel):
    game_id: UUID
