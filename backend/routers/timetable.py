from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import TimetableBlock
from schemas import TimetableBlockOut
from typing import List

router = APIRouter(prefix="/api/timetable", tags=["timetable"])


@router.get("/", response_model=List[TimetableBlockOut])
def get_all_blocks(db: Session = Depends(get_db)):
    return db.query(TimetableBlock).all()


@router.get("/{day}", response_model=List[TimetableBlockOut])
def get_blocks_for_day(day: str, db: Session = Depends(get_db)):
    return db.query(TimetableBlock).filter(
        TimetableBlock.day_of_week == day.lower()
    ).order_by(TimetableBlock.start_time).all()
