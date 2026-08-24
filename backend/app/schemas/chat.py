from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class SenderRole(str, Enum):
    buyer = "buyer"
    admin = "admin"
    system = "system"

class ChatMessageCreate(BaseModel):
    sender_type: SenderRole = SenderRole.buyer
    sender_name: str = Field("Покупатель", max_length=100)
    message: str = Field(..., min_length=1, max_length=2000)
    attachment_url: Optional[str] = None

class ChatMessageResponse(BaseModel):
    id: str
    order_id: str
    sender_type: SenderRole
    sender_name: str
    message: str
    attachment_url: Optional[str] = None
    created_at: datetime
