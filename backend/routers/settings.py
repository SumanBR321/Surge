from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import GrowthScoreWeight, NonNegotiable
from schemas import WeightUpdate, WeightOut, NonNegotiableOut
from typing import List

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("/weights", response_model=List[WeightOut])
def get_weights(db: Session = Depends(get_db)):
    return db.query(GrowthScoreWeight).all()


@router.put("/weights", response_model=List[WeightOut])
def update_weights(payload: List[WeightUpdate], db: Session = Depends(get_db)):
    for item in payload:
        w = db.query(GrowthScoreWeight).filter(GrowthScoreWeight.key == item.key).first()
        if w:
            w.weight = item.weight
        else:
            db.add(GrowthScoreWeight(key=item.key, weight=item.weight))
    db.commit()
    return db.query(GrowthScoreWeight).all()


@router.get("/non-negotiables", response_model=List[NonNegotiableOut])
def get_non_negotiables(db: Session = Depends(get_db)):
    return db.query(NonNegotiable).all()
