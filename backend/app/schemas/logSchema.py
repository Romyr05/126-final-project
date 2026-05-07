from pydantic import BaseModel
from typing import Literal
from uuid import UUID


class LogCreate(BaseModel):
    game_id: UUID
    status: Literal['played', 'playing', 'completed', 'dropped', 'wishlist']  #only these values