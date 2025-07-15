from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Episode(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, description="Clickbait episode title")
    description: str = Field(description="Real engineering issue description")
    submitted_by: str = Field(max_length=100, description="Name of person who submitted")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    image_url: Optional[str] = Field(default=None, description="URL to AI-generated episode image")

class EpisodeCreate(SQLModel):
    description: str
    submitted_by: str

class EpisodeRead(SQLModel):
    id: int
    title: str
    description: str
    submitted_by: str
    timestamp: datetime
    image_url: Optional[str] = None

class AdminSettings(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    is_submission_open: bool = Field(default=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AdminSettingsUpdate(SQLModel):
    is_submission_open: bool

class AdminSettingsRead(SQLModel):
    id: int
    is_submission_open: bool
    updated_at: datetime

class StatusRead(SQLModel):
    is_submission_open: bool