from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

# this is basically the class model for the review
class ReviewCreate(BaseModel):
    game_id: UUID
    rating: int = Field(..., ge=1, le=5)   
    review_text: str | None


class ReviewUpdate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    review_text: str | None
