from fastapi import FastAPI
from app.routes.favorites import router as favorites_router
from app.routes.games import router as games_router
from app.routes.lists import router as lists_router
from app.routes.logs import router as logs_router
from app.routes.reviews import router as reviews_router

app = FastAPI()
app.include_router(favorites_router)
app.include_router(games_router)
app.include_router(lists_router)
app.include_router(logs_router)
app.include_router(reviews_router)


@app.get("/")
def root():
    return {"message": "Hello World"}
