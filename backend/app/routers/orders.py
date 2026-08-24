from fastapi import APIRouter, HTTPException, Path
from typing import Optional
from app.schemas.order import (
    CreateOrderRequest,
    OrderResponse,
    ConfirmPaymentRequest,
    UpdateOrderStatusRequest,
    OrderStatus
)
from app.services.wallet_validator import WalletValidator
from app.services.rate_engine import RateEngine
from app.services.supabase_service import SupabaseService

router = APIRouter(prefix="/orders", tags=["Orders & Escrow"])

@router.post("", response_model=OrderResponse)
async def create_order(req: CreateOrderRequest):
    """
    Creates a new B2C USDT purchase order with wallet validation and rate calculation.
    """
    # 1. Validate wallet format for chosen network
    is_valid_wallet, wallet_err = WalletValidator.validate(req.crypto_network, req.wallet_address)
    if not is_valid_wallet:
        raise HTTPException(status_code=400, detail=wallet_err)

    # 2. Get live rates and network specs
    db_rates = await SupabaseService.get_rates_config(req.fiat_currency.value)
    rate_override = db_rates[0] if db_rates else None
    
    db_reserves = await SupabaseService.get_network_reserves()
    net_override = next((r for r in db_reserves if r.get("network") == req.crypto_network.value), None)

    # 3. Calculate financial details
    calc = RateEngine.calculate(
        fiat_currency=req.fiat_currency,
        crypto_network=req.crypto_network,
        fiat_amount=req.fiat_amount,
        rates_override=rate_override,
        network_override=net_override
    )

    if not calc.is_within_limits:
        raise HTTPException(status_code=400, detail=calc.validation_message or "Order amount out of bounds.")

    # 4. Create order record
    order_payload = {
        "fiat_currency": req.fiat_currency.value,
        "fiat_amount": calc.fiat_amount,
        "crypto_network": req.crypto_network.value,
        "crypto_amount": calc.crypto_amount,
        "exchange_rate": calc.exchange_rate,
        "network_fee_usdt": calc.network_fee_usdt,
        "wallet_address": req.wallet_address.strip(),
        "buyer_contact": req.buyer_contact.strip(),
        "buyer_name": req.buyer_name,
    }

    created_order = await SupabaseService.create_order(order_payload)
    
    # Explorer base URL
    explorer_url = net_override.get("explorer_tx_url", "") if net_override else ""
    created_order["explorer_url"] = explorer_url

    return created_order

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str = Path(..., description="Order UUID, short code, or secret token")):
    """
    Retrieves order details for live tracking and status updates.
    """
    order = await SupabaseService.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден.")
        
    db_reserves = await SupabaseService.get_network_reserves()
    net_override = next((r for r in db_reserves if r.get("network") == order.get("crypto_network")), None)
    if net_override:
        order["explorer_url"] = net_override.get("explorer_tx_url", "")

    return order

@router.post("/{order_id}/confirm-payment", response_model=OrderResponse)
async def confirm_payment(
    order_id: str,
    req: ConfirmPaymentRequest
):
    """
    Called by buyer to confirm they have transferred funds via Visa/Mastercard/MBank.
    """
    order = await SupabaseService.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден.")

    if order.get("status") in [OrderStatus.COMPLETED.value, OrderStatus.CANCELLED.value]:
        raise HTTPException(status_code=400, detail="Невозможно изменить статус завершенного или отмененного заказа.")

    extra = {
        "bank_reference_id": req.bank_reference_id,
        "user_receipt_url": req.user_receipt_url
    }
    
    updated = await SupabaseService.update_order_status(
        order["id"],
        OrderStatus.PAID_CONFIRMED_BY_USER.value,
        extra
    )
    
    return {**order, **updated}

@router.post("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(order_id: str):
    """
    Cancels an active order.
    """
    order = await SupabaseService.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден.")

    if order.get("status") in [OrderStatus.USDT_DISPATCHED.value, OrderStatus.COMPLETED.value]:
        raise HTTPException(status_code=400, detail="Невозможно отменить заказ после отправки криптовалюты.")

    updated = await SupabaseService.update_order_status(order["id"], OrderStatus.CANCELLED.value)
    return {**order, **updated}
