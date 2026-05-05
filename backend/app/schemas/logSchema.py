from pydantic import BaseModel
from typing import Optional,Literal
from uuid import UUID
from datetime import date


class LogCreate(BaseModel):
    game_id: UUID
    status: Literal["played", "playing", "completed", "dropped", "wishlist"]  #only these values
    played_at: Optional[date] = None
    notes: Optional[str] = None