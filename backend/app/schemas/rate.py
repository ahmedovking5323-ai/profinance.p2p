from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from .order import CryptoNetwork, FiatCurrency

class RateCalculationRequest(BaseModel):
    fiat_currency: FiatCurrency
    fiat_amount: Optional[float] = Field(None, gt=0, description="Amount in fiat")
    crypto_amount: Optional[float] = Field(None, gt=0, description="Target amount in USDT")
    crypto_network: CryptoNetwork = CryptoNetwork.TRC20

class NetworkFeeInfo(BaseModel):
    network: CryptoNetwork
    name: str
    network_fee_usdt: float
    est_delivery_minutes: int
    reserve_usdt: float
    is_active: bool
    explorer_tx_url: str

class RateCalculationResponse(BaseModel):
    fiat_currency: FiatCurrency
    fiat_amount: float
    crypto_network: CryptoNetwork
    crypto_amount: float # Net USDT to receive
    gross_crypto_amount: float
    network_fee_usdt: float
    exchange_rate: float # Effective rate (e.g. KGS per 1 USDT)
    base_rate_usd: float
    margin_percent: float
    min_order_usdt: float
    max_order_usdt: float
    is_within_limits: bool
    validation_message: Optional[str] = None

class RatesConfigResponse(BaseModel):
    fiat_currency: FiatCurrency
    base_rate_usd: float
    margin_percent: float
    effective_rate: float
    min_order_usdt: float
    max_order_usdt: float
    is_active: bool

class UpdateRatesConfigRequest(BaseModel):
    base_rate_usd: Optional[float] = Field(None, gt=0)
    margin_percent: Optional[float] = Field(None, ge=0, le=20)
    min_order_usdt: Optional[float] = Field(None, gt=0)
    max_order_usdt: Optional[float] = Field(None, gt=0)
    is_active: Optional[bool] = None

class UpdateReserveRequest(BaseModel):
    reserve_usdt: Optional[float] = Field(None, ge=0)
    network_fee_usdt: Optional[float] = Field(None, ge=0)
    est_delivery_minutes: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None
