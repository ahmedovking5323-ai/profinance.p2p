from typing import Optional
from pydantic import BaseModel, Field
from .order import FiatCurrency

class AdminLoginRequest(BaseModel):
    secret_key: str = Field(..., description="Admin passcode / API secret key")

class AdminLoginResponse(BaseModel):
    authenticated: bool
    token: str
    message: str

class PaymentMethodCreate(BaseModel):
    bank_name: str
    card_number: str
    recipient_name: str
    currency: FiatCurrency = FiatCurrency.KGS
    is_active: bool = True
    instructions: Optional[str] = None
    daily_limit_kgs: Optional[float] = 1000000.00

class PaymentMethodUpdate(BaseModel):
    bank_name: Optional[str] = None
    card_number: Optional[str] = None
    recipient_name: Optional[str] = None
    currency: Optional[FiatCurrency] = None
    is_active: Optional[bool] = None
    instructions: Optional[str] = None
    daily_limit_kgs: Optional[float] = None
