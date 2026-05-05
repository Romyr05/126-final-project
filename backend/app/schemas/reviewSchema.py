from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class ReviewCreate(BaseModel):
    game_id: UUID
    rating: float = Field(..., ge=0, le=5)
    review_text: str | None