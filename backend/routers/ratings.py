from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import DailyRating
from schemas import DailyRatingUpsert, DailyRatingOut
from datetime import date

router = APIRouter(prefix="/api/ratings", tags=["ratings"])


@router.get("/{rating_date}", response_model=DailyRatingOut)
def get_rating(rating_date: date, db: Session = Depends(get_db)):
    r = db.query(DailyRating).filter(DailyRating.date == rating_date).first()
    if not r:
        raise HTTPException(status_code=404, detail="No rating for this date")
    return r


@router.put("/", response_model=DailyRatingOut)
def upsert_rating(payload: DailyRatingUpsert, db: Session = Depends(get_db)):
    r = db.query(DailyRating).filter(DailyRating.date == payload.date).first()
    if r:
        for k, v in payload.model_dump().items():
            setattr(r, k, v)
    else:
        r = DailyRating(**payload.model_dump())
        db.add(r)
    db.commit()
    db.refresh(r)
    return r
