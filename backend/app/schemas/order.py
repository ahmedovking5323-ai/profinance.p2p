from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class OrderStatus(str, Enum):
    CREATED = "CREATED"
    AWAITING_PAYMENT = "AWAITING_PAYMENT"
    PAID_CONFIRMED_BY_USER = "PAID_CONFIRMED_BY_USER"
    VERIFIED_BY_ADMIN = "VERIFIED_BY_ADMIN"
    USDT_DISPATCHED = "USDT_DISPATCHED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class CryptoNetwork(str, Enum):
    TRC20 = "TRC20"
    BEP20 = "BEP20"
    ERC20 = "ERC20"
    TON = "TON"

class FiatCurrency(str, Enum):
    KGS = "KGS"
    USD = "USD"

class CreateOrderRequest(BaseModel):
    fiat_currency: FiatCurrency = Field(..., description="Currency being paid: KGS or USD")
    fiat_amount: float = Field(..., gt=0, description="Amount in fiat currency (e.g. 5000 KGS or 100 USD)")
    crypto_network: CryptoNetwork = Field(..., description="TRC20, BEP20, ERC20, or TON")
    wallet_address: str = Field(..., min_length=10, description="Destination USDT address")
    buyer_contact: str = Field(..., min_length=3, description="Phone, Telegram handle or WhatsApp")
    buyer_name: Optional[str] = Field(None, description="Buyer's name")
    payment_method_id: Optional[str] = Field(None, description="Preferred bank card/method ID")

class ConfirmPaymentRequest(BaseModel):
    bank_reference_id: Optional[str] = Field(None, description="User's bank transaction receipt/reference number")
    user_receipt_url: Optional[str] = Field(None, description="Uploaded screenshot URL in storage")

class DispatchOrderRequest(BaseModel):
    tx_hash: str = Field(..., min_length=10, description="Blockchain transaction hash")
    admin_notes: Optional[str] = None

class UpdateOrderStatusRequest(BaseModel):
    status: OrderStatus
    admin_notes: Optional[str] = None
    tx_hash: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    order_code: str
    secret_token: str
    fiat_currency: FiatCurrency
    fiat_amount: float
    crypto_network: CryptoNetwork
    crypto_amount: float
    exchange_rate: float
    network_fee_usdt: float
    wallet_address: str
    buyer_contact: str
    buyer_name: Optional[str] = None
    status: OrderStatus
    payment_method_id: Optional[str] = None
    user_receipt_url: Optional[str] = None
    bank_reference_id: Optional[str] = None
    tx_hash: Optional[str] = None
    admin_notes: Optional[str] = None
    expires_at: datetime
    paid_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    # Requisite info included if available
    bank_name: Optional[str] = None
    card_number: Optional[str] = None
    recipient_name: Optional[str] = None
    payment_instructions: Optional[str] = None
    explorer_url: Optional[str] = None
