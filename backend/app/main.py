from urllib.parse import urlparse

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes.favorites import router as favorites_router
from app.routes.games import router as games_router
from app.routes.genres import router as genres_router
from app.routes.lists import router as lists_router
from app.routes.logs import router as logs_router
from app.routes.recommendations import router as recommendations_router
from app.routes.reviews import router as reviews_router
from app.routes.users import router as users_router
from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.core.config import settings

app = FastAPI()

# middleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


def _origin_from_url(value: str | None) -> str | None:
    if not value:
        return None

    parsed = urlparse(value)

    if not parsed.scheme or not parsed.netloc:
        return None

    return f"{parsed.scheme}://{parsed.netloc}"


@app.middleware("http")
async def protect_cookie_auth_writes(request: Request, call_next):
    unsafe_method = request.method in {"POST", "PUT", "PATCH", "DELETE"}
    has_auth_cookie = (
        settings.ACCESS_COOKIE_NAME in request.cookies
        or settings.REFRESH_COOKIE_NAME in request.cookies
    )
    uses_bearer_auth = bool(request.headers.get("authorization"))

    if unsafe_method and has_auth_cookie and not uses_bearer_auth:
        allowed_origins = set(settings.FRONTEND_ORIGINS)
        origin = request.headers.get("origin")
        referer_origin = _origin_from_url(request.headers.get("referer"))

        if origin not in allowed_origins and referer_origin not in allowed_origins:
            return JSONResponse(
                status_code=403,
                content={"detail": "Invalid request origin"},
            )

    return await call_next(request)

app.include_router(favorites_router)
app.include_router(games_router)
app.include_router(genres_router)
app.include_router(lists_router)
app.include_router(logs_router)
app.include_router(recommendations_router)
app.include_router(reviews_router)
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(profile_router)

# can make a def but hassle


@app.get("/")
def root():
    return {"message": "Hello World"}
