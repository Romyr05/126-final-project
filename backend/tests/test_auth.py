from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.utils import auth


def test_get_current_user_validates_bearer_token(monkeypatch):
    expected_user = SimpleNamespace(id="user-id")

    def fake_get_user(token):
        assert token == "access-token"
        return SimpleNamespace(user=expected_user)

    fake_supabase = SimpleNamespace(auth=SimpleNamespace(get_user=fake_get_user))
    monkeypatch.setattr(auth, "create_user_supabase", lambda token: fake_supabase)

    auth_context = auth.get_auth_context(
        HTTPAuthorizationCredentials(
            scheme="Bearer",
            credentials="access-token",
        )
    )

    assert auth_context.user is expected_user
    assert auth_context.supabase is fake_supabase


def test_get_current_user_rejects_invalid_token(monkeypatch):
    fake_supabase = SimpleNamespace(
        auth=SimpleNamespace(get_user=lambda token: SimpleNamespace(user=None))
    )
    monkeypatch.setattr(auth, "create_user_supabase", lambda token: fake_supabase)

    with pytest.raises(HTTPException) as exc_info:
        auth.get_auth_context(
            HTTPAuthorizationCredentials(
                scheme="Bearer",
                credentials="bad-token",
            )
        )

    assert exc_info.value.status_code == 401
