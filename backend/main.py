from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal
from models import Base
from seed import run_seed
from routers import timetable, logs, ratings, scores, settings, weekly

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Surge API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(timetable.router)
app.include_router(logs.router)
app.include_router(ratings.router)
app.include_router(scores.router)
app.include_router(settings.router)
app.include_router(weekly.router)


@app.on_event("startup")
def startup():
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}
