from fastapi import APIRouter, HTTPException, Header, Depends
from typing import List, Optional
from app.config import settings
from app.schemas.order import OrderResponse, OrderStatus, DispatchOrderRequest
from app.schemas.rate import UpdateRatesConfigRequest, UpdateReserveRequest, RatesConfigResponse, NetworkFeeInfo
from app.schemas.admin import AdminLoginRequest, AdminLoginResponse, PaymentMethodCreate, PaymentMethodUpdate
from app.services.supabase_service import SupabaseService
from app.services.rate_engine import RateEngine

router = APIRouter(prefix="/admin", tags=["Admin Control Dashboard"])

def verify_admin_token(x_admin_key: Optional[str] = Header(None)):
    if not x_admin_key or x_admin_key != settings.ADMIN_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Неверный ключ доступа администратора.")
    return True

@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(req: AdminLoginRequest):
    """
    Validates admin passcode / key.
    """
    if req.secret_key == settings.ADMIN_SECRET_KEY:
        return AdminLoginResponse(
            authenticated=True,
            token=settings.ADMIN_SECRET_KEY,
            message="Успешная авторизация в панели оператора."
        )
    raise HTTPException(status_code=401, detail="Неверный ключ доступа.")

@router.get("/orders", response_model=List[OrderResponse])
async def list_admin_orders(
    status: Optional[str] = None,
    limit: int = 100,
    auth: bool = Depends(verify_admin_token)
):
    """
    Lists all orders with filtering.
    """
    orders = await SupabaseService.list_orders(status=status, limit=limit)
    return orders

@router.post("/orders/{order_id}/verify", response_model=OrderResponse)
async def admin_verify_payment(
    order_id: str,
    auth: bool = Depends(verify_admin_token)
):
    """
    Admin confirms receipt of fiat payment from the buyer's card/bank transfer.
    """
    order = await SupabaseService.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден.")

    updated = await SupabaseService.update_order_status(
        order["id"],
        OrderStatus.VERIFIED_BY_ADMIN.value
    )
    return {**order, **updated}

@router.post("/orders/{order_id}/dispatch", response_model=OrderResponse)
async def admin_dispatch_usdt(
    order_id: str,
    req: DispatchOrderRequest,
    auth: bool = Depends(verify_admin_token)
):
    """
    Admin enters the on-chain TX hash and marks order as USDT dispatched & completed.
    """
    order = await SupabaseService.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден.")

    extra = {
        "tx_hash": req.tx_hash.strip(),
        "admin_notes": req.admin_notes
    }
    
    updated = await SupabaseService.update_order_status(
        order["id"],
        OrderStatus.COMPLETED.value,
        extra
    )
    return {**order, **updated}

@router.put("/rates/{currency}")
async def update_rates_config(
    currency: str,
    req: UpdateRatesConfigRequest,
    auth: bool = Depends(verify_admin_token)
):
    """
    Updates base rate, spread/margin, and limits for KGS or USD.
    """
    updates = req.model_dump(exclude_unset=True)
    res = await SupabaseService.update_rates_config(currency.upper(), updates)
    return {"status": "success", "updated": res}

@router.put("/reserves/{network}")
async def update_network_reserve(
    network: str,
    req: UpdateReserveRequest,
    auth: bool = Depends(verify_admin_token)
):
    """
    Updates available USDT reserve balance and network fee.
    """
    updates = req.model_dump(exclude_unset=True)
    res = await SupabaseService.update_network_reserve(network.upper(), updates)
    return {"status": "success", "updated": res}

@router.get("/payment-methods")
async def get_all_payment_methods(auth: bool = Depends(verify_admin_token)):
    """
    Retrieves all payment methods and bank cards.
    """
    methods = await SupabaseService.get_payment_methods()
    return methods

@router.post("/payment-methods")
async def create_payment_method(
    req: PaymentMethodCreate,
    auth: bool = Depends(verify_admin_token)
):
    """
    Adds a new bank card or payment requisite.
    """
    created = await SupabaseService.add_payment_method(req.model_dump())
    return created
