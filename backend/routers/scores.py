"""
Growth score computation:
  score = sum(weight_i * min(actual_i / target_i, 1.0)) * 100

Dimensions:
  - adherence: fraction of today's scheduled blocks marked done/partial
  - placement / learning / workout: minutes_completed vs target (30 min default)
  - sleep: sleep_hours vs 7.5 target
  - self_priority: (self_priority_score - 1) / 4  (maps 1-5 → 0-1)
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import DailyLog, DailyRating, GrowthScoreWeight, TimetableBlock
from schemas import DailyScoreOut
from typing import List
from datetime import date, timedelta

router = APIRouter(prefix="/api/scores", tags=["scores"])

CATEGORY_TARGETS = {
    "placement": 30,
    "learning": 30,
    "workout": 30,
    "project": 30,
    "freelance": 60,
    "college": 60,
}


def compute_score(target_date: date, db: Session) -> float:
    weights = {w.key: w.weight for w in db.query(GrowthScoreWeight).all()}
    if not weights:
        return 0.0

    logs = db.query(DailyLog).filter(DailyLog.date == target_date).all()
    rating = db.query(DailyRating).filter(DailyRating.date == target_date).first()

    # Day name for timetable lookup
    day_name = target_date.strftime("%A").lower()
    scheduled = db.query(TimetableBlock).filter(
        TimetableBlock.day_of_week == day_name
    ).count()

    score = 0.0
    total_weight = sum(weights.values())

    # Adherence
    if "adherence" in weights and scheduled > 0:
        done_count = sum(1 for l in logs if l.status in ("done", "partial"))
        adherence = min(done_count / scheduled, 1.0)
        score += weights["adherence"] * adherence

    # Per-category minutes
    for cat in ["placement", "learning", "workout"]:
        if cat not in weights:
            continue
        target_mins = CATEGORY_TARGETS.get(cat, 30)
        actual = sum(l.minutes_completed for l in logs if l.category == cat)
        score += weights[cat] * min(actual / target_mins, 1.0)

    # Sleep
    if "sleep" in weights and rating:
        sleep_norm = min(rating.sleep_hours / 7.5, 1.0)
        score += weights["sleep"] * sleep_norm

    # Self priority (1-5 → 0-1)
    if "self_priority" in weights and rating:
        sp_norm = (rating.self_priority_score - 1) / 4.0
        score += weights["self_priority"] * sp_norm

    return round(score * 100 / max(total_weight, 1), 1)


@router.get("/range", response_model=List[DailyScoreOut])
def get_scores_range(start: date, end: date, db: Session = Depends(get_db)):
    results = []
    current = start
    while current <= end:
        results.append({"date": current, "score": compute_score(current, db)})
        current += timedelta(days=1)

    # Compute 7-day rolling average
    for i, entry in enumerate(results):
        window = results[max(0, i - 6) : i + 1]
        entry["rolling_avg"] = round(
            sum(w["score"] for w in window) / len(window), 1
        )

    return results


@router.get("/today", response_model=DailyScoreOut)
def get_today_score(db: Session = Depends(get_db)):
    today = date.today()
    s = compute_score(today, db)
    return {"date": today, "score": s, "rolling_avg": None}
