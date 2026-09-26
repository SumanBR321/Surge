from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import DailyLog, TimetableBlock
from datetime import date, timedelta
from typing import List, Dict

router = APIRouter(prefix="/api/weekly", tags=["weekly"])


@router.get("/adherence")
def get_weekly_adherence(db: Session = Depends(get_db)) -> Dict:
    """
    Returns per-category adherence % for the current week (Mon-today).
    """
    today = date.today()
    # Start of week (Monday)
    start = today - timedelta(days=today.weekday())

    categories = ["college", "freelance", "placement", "project",
                  "workout", "learning", "finance", "sleep", "other"]
    result: Dict[str, Dict] = {cat: {"scheduled": 0, "completed": 0} for cat in categories}

    current = start
    while current <= today:
        day_name = current.strftime("%A").lower()
        blocks = db.query(TimetableBlock).filter(
            TimetableBlock.day_of_week == day_name
        ).all()

        logs_for_day = db.query(DailyLog).filter(DailyLog.date == current).all()
        log_map = {l.block_id: l for l in logs_for_day}

        for block in blocks:
            cat = block.category
            result[cat]["scheduled"] += 1
            log = log_map.get(block.id)
            if log and log.status in ("done", "partial"):
                result[cat]["completed"] += 1

        current += timedelta(days=1)

    # Compute percentages
    final = []
    for cat, data in result.items():
        if data["scheduled"] > 0:
            final.append({
                "category": cat,
                "scheduled": data["scheduled"],
                "completed": data["completed"],
                "adherence_pct": round(data["completed"] / data["scheduled"] * 100, 1),
            })

    return {"week_start": start.isoformat(), "week_end": today.isoformat(), "data": final}
