from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.rate import (
    RateCalculationRequest,
    RateCalculationResponse,
    RatesConfigResponse,
    NetworkFeeInfo
)
from app.schemas.order import FiatCurrency, CryptoNetwork
from app.services.rate_engine import RateEngine
from app.services.supabase_service import SupabaseService

router = APIRouter(prefix="/rates", tags=["Rates & Calculator"])

@router.post("/calculate", response_model=RateCalculationResponse)
async def calculate_rate(req: RateCalculationRequest):
    """
    Calculates exchange rate, margins, net USDT to receive, and validates limits.
    """
    # Fetch live rates from Supabase
    db_rates = await SupabaseService.get_rates_config(req.fiat_currency.value)
    rate_override = db_rates[0] if db_rates else None
    
    # Fetch network config
    db_reserves = await SupabaseService.get_network_reserves()
    net_override = next((r for r in db_reserves if r.get("network") == req.crypto_network.value), None)

    calc = RateEngine.calculate(
        fiat_currency=req.fiat_currency,
        crypto_network=req.crypto_network,
        fiat_amount=req.fiat_amount,
        crypto_amount=req.crypto_amount,
        rates_override=rate_override,
        network_override=net_override
    )
    return calc

@router.get("/config", response_model=List[RatesConfigResponse])
async def get_rates_config():
    """
    Retrieves current base rates and margin percentages for KGS and USD.
    """
    configs = await SupabaseService.get_rates_config()
    results = []
    for c in configs:
        base = float(c.get("base_rate_usd", 87.50))
        margin = float(c.get("margin_percent", 1.20))
        effective = RateEngine.get_effective_rate(base, margin)
        results.append(RatesConfigResponse(
            fiat_currency=c.get("fiat_currency"),
            base_rate_usd=base,
            margin_percent=margin,
            effective_rate=effective,
            min_order_usdt=float(c.get("min_order_usdt", 20.0)),
            max_order_usdt=float(c.get("max_order_usdt", 10000.0)),
            is_active=bool(c.get("is_active", True))
        ))
    return results

@router.get("/reserves", response_model=List[NetworkFeeInfo])
async def get_network_reserves():
    """
    Retrieves network fees, speeds, and available USDT reserves for TRC20, BEP20, ERC20, TON.
    """
    reserves = await SupabaseService.get_network_reserves()
    return [
        NetworkFeeInfo(
            network=r.get("network"),
            name=r.get("name", r.get("network")),
            network_fee_usdt=float(r.get("network_fee_usdt", 1.0)),
            est_delivery_minutes=int(r.get("est_delivery_minutes", 2)),
            reserve_usdt=float(r.get("reserve_usdt", 50000.0)),
            is_active=bool(r.get("is_active", True)),
            explorer_tx_url=r.get("explorer_tx_url", "")
        )
        for r in reserves
    ]
