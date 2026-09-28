"""
Seed the database from timetable_seed.json on first run.
Only runs if timetable_blocks table is empty.
"""
import json
import os
from pathlib import Path
from sqlalchemy.orm import Session
from models import TimetableBlock, GrowthScoreWeight, NonNegotiable


SEED_PATH = Path(__file__).parent.parent / "timetable_seed.json"


def run_seed(db: Session) -> None:
    if db.query(TimetableBlock).count() > 0:
        return  # already seeded

    with open(SEED_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Seed timetable blocks
    for block in data["blocks"]:
        db.add(TimetableBlock(**block))

    # Seed growth score weights
    for key, weight in data["growth_score_weights"].items():
        db.add(GrowthScoreWeight(key=key, weight=weight))

    # Seed non-negotiables
    for nn in data["non_negotiables"]:
        db.add(NonNegotiable(area=nn["area"], rule=nn["rule"]))

    db.commit()
    print("Database seeded from timetable_seed.json")
