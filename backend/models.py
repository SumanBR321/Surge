from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from database import Base
import enum


class CategoryEnum(str, enum.Enum):
    college = "college"
    freelance = "freelance"
    placement = "placement"
    project = "project"
    workout = "workout"
    learning = "learning"
    finance = "finance"
    sleep = "sleep"
    other = "other"


class StatusEnum(str, enum.Enum):
    done = "done"
    partial = "partial"
    missed = "missed"
    pending = "pending"


class TimetableBlock(Base):
    __tablename__ = "timetable_blocks"
    id = Column(Integer, primary_key=True, index=True)
    day_of_week = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    category = Column(String, nullable=False)
    label = Column(String, nullable=False)
    logs = relationship("DailyLog", back_populates="block")


class DailyLog(Base):
    __tablename__ = "daily_logs"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    block_id = Column(Integer, ForeignKey("timetable_blocks.id"), nullable=True)
    category = Column(String, nullable=False)
    minutes_completed = Column(Integer, default=0)
    status = Column(String, default=StatusEnum.pending)
    notes = Column(Text, default="")
    block = relationship("TimetableBlock", back_populates="logs")


class DailyRating(Base):
    __tablename__ = "daily_ratings"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, unique=True, index=True)
    sleep_hours = Column(Float, default=0.0)
    self_priority_score = Column(Integer, default=3)
    savings_amount = Column(Float, default=0.0)
    notes = Column(Text, default="")


class GrowthScoreWeight(Base):
    __tablename__ = "growth_score_weights"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False)
    weight = Column(Float, nullable=False)


class NonNegotiable(Base):
    __tablename__ = "non_negotiables"
    id = Column(Integer, primary_key=True, index=True)
    area = Column(String, nullable=False)
    rule = Column(Text, nullable=False)
