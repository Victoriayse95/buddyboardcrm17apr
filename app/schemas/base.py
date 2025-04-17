from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TimestampModel(BaseModel):
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 