from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.reviewSchema import ReviewCreate


def test_review_create_allows_rating_without_text():
    review = ReviewCreate(game_id=uuid4(), rating=5)

    assert review.review_text is None


def test_review_create_requires_rating_in_valid_range():
    with pytest.raises(ValidationError):
        ReviewCreate(game_id=uuid4(), rating=6)
