from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.favorites import router as favorites_router
from app.routes.games import router as games_router
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
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(favorites_router)
app.include_router(games_router)
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
