from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from database import get_db
from models import DailyLog
from schemas import DailyLogCreate, DailyLogOut, DailyLogUpdate
from typing import List
from datetime import date

router = APIRouter(prefix="/api/logs", tags=["logs"])


@router.get("/{log_date}", response_model=List[DailyLogOut])
def get_logs_for_date(log_date: date, db: Session = Depends(get_db)):
    return db.query(DailyLog).filter(DailyLog.date == log_date).all()


@router.post("/", response_model=DailyLogOut)
def create_log(payload: DailyLogCreate, db: Session = Depends(get_db)):
    log = DailyLog(**payload.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.patch("/{log_id}", response_model=DailyLogOut)
def update_log(log_id: int, payload: DailyLogUpdate, db: Session = Depends(get_db)):
    log = db.query(DailyLog).filter(DailyLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(log, k, v)
    db.commit()
    db.refresh(log)
    return log


@router.delete("/{log_id}")
def delete_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(DailyLog).filter(DailyLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    db.delete(log)
    db.commit()
    return {"ok": True}
