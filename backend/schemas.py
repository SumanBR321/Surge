from datetime import date
from typing import Optional
from pydantic import BaseModel


# ── Timetable ──────────────────────────────────────────────────────────────
class TimetableBlockOut(BaseModel):
    id: int
    day_of_week: str
    start_time: str
    end_time: str
    category: str
    label: str

    model_config = {"from_attributes": True}


# ── Daily Logs ─────────────────────────────────────────────────────────────
class DailyLogCreate(BaseModel):
    date: date
    block_id: Optional[int] = None
    category: str
    minutes_completed: int = 0
    status: str = "pending"
    notes: str = ""


class DailyLogUpdate(BaseModel):
    minutes_completed: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class DailyLogOut(BaseModel):
    id: int
    date: date
    block_id: Optional[int]
    category: str
    minutes_completed: int
    status: str
    notes: str

    model_config = {"from_attributes": True}


# ── Daily Ratings ──────────────────────────────────────────────────────────
class DailyRatingUpsert(BaseModel):
    date: date
    sleep_hours: float = 0.0
    self_priority_score: int = 3
    savings_amount: float = 0.0
    notes: str = ""


class DailyRatingOut(BaseModel):
    id: int
    date: date
    sleep_hours: float
    self_priority_score: int
    savings_amount: float
    notes: str

    model_config = {"from_attributes": True}


# ── Growth Score ───────────────────────────────────────────────────────────
class DailyScoreOut(BaseModel):
    date: date
    score: float
    rolling_avg: Optional[float] = None


# ── Weights ────────────────────────────────────────────────────────────────
class WeightUpdate(BaseModel):
    key: str
    weight: float


class WeightOut(BaseModel):
    key: str
    weight: float

    model_config = {"from_attributes": True}


# ── Non-Negotiables ────────────────────────────────────────────────────────
class NonNegotiableOut(BaseModel):
    id: int
    area: str
    rule: str

    model_config = {"from_attributes": True}
