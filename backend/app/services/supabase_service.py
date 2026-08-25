import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from app.config import settings
from app.schemas.order import OrderStatus, CryptoNetwork, FiatCurrency

try:
    from supabase import create_client, Client
    _has_supabase_lib = True
except ImportError:
    _has_supabase_lib = False
    Client = Any

class SupabaseService:
    _client: Optional[Client] = None
    
    # In-memory storage fallback for local development / testing
    _memory_orders: Dict[str, Dict[str, Any]] = {}
    _memory_messages: List[Dict[str, Any]] = []
    _memory_rates: Dict[str, Dict[str, Any]] = {
        "KGS": {"fiat_currency": "KGS", "base_rate_usd": 87.50, "margin_percent": 1.20, "min_order_usdt": 20.0, "max_order_usdt": 10000.0, "is_active": True},
        "USD": {"fiat_currency": "USD", "base_rate_usd": 1.00, "margin_percent": 1.00, "min_order_usdt": 20.0, "max_order_usdt": 15000.0, "is_active": True}
    }
    _memory_reserves: Dict[str, Dict[str, Any]] = {
        "TRC20": {"network": "TRC20", "name": "TRON (TRC-20)", "reserve_usdt": 75000.0, "network_fee_usdt": 1.20, "est_delivery_minutes": 2, "explorer_tx_url": "https://tronscan.org/#/transaction/", "is_active": True},
        "BEP20": {"network": "BEP20", "name": "BNB Smart Chain (BEP-20)", "reserve_usdt": 50000.0, "network_fee_usdt": 0.40, "est_delivery_minutes": 1, "explorer_tx_url": "https://bscscan.com/tx/", "is_active": True},
        "ERC20": {"network": "ERC20", "name": "Ethereum (ERC-20)", "reserve_usdt": 30000.0, "network_fee_usdt": 4.50, "est_delivery_minutes": 5, "explorer_tx_url": "https://etherscan.io/tx/", "is_active": True},
        "TON": {"network": "TON", "name": "The Open Network (TON)", "reserve_usdt": 40000.0, "network_fee_usdt": 0.25, "est_delivery_minutes": 1, "explorer_tx_url": "https://tonscan.org/tx/", "is_active": True}
    }
    _memory_payment_methods: List[Dict[str, Any]] = [
        {
            "id": "11111111-1111-1111-1111-111111111111",
            "bank_name": "MBank (КБ Кыргызстан)",
            "card_number": "0999119118",
            "recipient_name": "Ахмедов У.",
            "currency": "KGS",
            "is_active": True,
            "instructions": "Перевод по номеру телефона или MBank: 0999119118. Получатель: Ахмедов У. В комментарии укажите номер заказа.",
            "daily_limit_kgs": 1500000.00
        },
        {
            "id": "22222222-2222-2222-2222-222222222222",
            "bank_name": "Optima Bank (Оптима)",
            "card_number": "0999119118",
            "recipient_name": "Ахмедов У.",
            "currency": "KGS",
            "is_active": True,
            "instructions": "Перевод по номеру или карте Optima Bank: 0999119118. Получатель: Ахмедов У.",
            "daily_limit_kgs": 1200000.00
        },
        {
            "id": "33333333-3333-3333-3333-333333333333",
            "bank_name": "DemirBank (Демир)",
            "card_number": "0999119118",
            "recipient_name": "Akhmedov U.",
            "currency": "USD",
            "is_active": True,
            "instructions": "USD transfer: 0999119118. Recipient: Akhmedov U.",
            "daily_limit_kgs": 50000.00
        }
    ]

    @classmethod
    def get_client(cls) -> Optional[Client]:
        if cls._client is None and _has_supabase_lib:
            try:
                if settings.SUPABASE_URL and "supabase.co" in settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY != "your-service-role-key":
                    cls._client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            except Exception:
                cls._client = None
        return cls._client

    # 1. RATES & RESERVES
    @classmethod
    async def get_rates_config(cls, currency: Optional[str] = None) -> List[Dict[str, Any]]:
        client = cls.get_client()
        if client:
            try:
                query = client.table("rates_config").select("*")
                if currency:
                    query = query.eq("fiat_currency", currency)
                res = query.execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        
        if currency:
            val = cls._memory_rates.get(currency)
            return [val] if val else []
        return list(cls._memory_rates.values())

    @classmethod
    async def update_rates_config(cls, currency: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        client = cls.get_client()
        if client:
            try:
                res = client.table("rates_config").update(updates).eq("fiat_currency", currency).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        
        if currency in cls._memory_rates:
            cls._memory_rates[currency].update(updates)
            return cls._memory_rates[currency]
        return updates

    @classmethod
    async def get_network_reserves(cls) -> List[Dict[str, Any]]:
        client = cls.get_client()
        if client:
            try:
                res = client.table("network_reserves").select("*").execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        return list(cls._memory_reserves.values())

    @classmethod
    async def update_network_reserve(cls, network: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        client = cls.get_client()
        if client:
            try:
                res = client.table("network_reserves").update(updates).eq("network", network).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        if network in cls._memory_reserves:
            cls._memory_reserves[network].update(updates)
            return cls._memory_reserves[network]
        return updates

    # 2. PAYMENT METHODS
    @classmethod
    async def get_payment_methods(cls, currency: Optional[str] = None) -> List[Dict[str, Any]]:
        client = cls.get_client()
        if client:
            try:
                query = client.table("payment_methods").select("*").eq("is_active", True)
                if currency:
                    query = query.eq("currency", currency)
                res = query.execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        
        if currency:
            return [p for p in cls._memory_payment_methods if p["currency"] == currency and p["is_active"]]
        return [p for p in cls._memory_payment_methods if p["is_active"]]

    @classmethod
    async def add_payment_method(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        client = cls.get_client()
        if client:
            try:
                res = client.table("payment_methods").insert(data).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        new_item = {
            "id": str(uuid.uuid4()),
            "created_at": datetime.utcnow().isoformat(),
            **data
        }
        cls._memory_payment_methods.append(new_item)
        return new_item

    # 3. ORDERS
    @classmethod
    async def create_order(cls, order_data: Dict[str, Any]) -> Dict[str, Any]:
        order_id = str(uuid.uuid4())
        secret_token = str(uuid.uuid4())
        order_code = f"KG-{str(uuid.uuid4().int)[:5]}"
        now = datetime.utcnow()
        expires_at = now + timedelta(minutes=15)

        # Pick matching payment method
        currency = order_data.get("fiat_currency", "KGS")
        methods = await cls.get_payment_methods(currency)
        chosen_method = methods[0] if methods else None
        
        full_order = {
            "id": order_id,
            "order_code": order_code,
            "secret_token": secret_token,
            "status": "AWAITING_PAYMENT",
            "payment_method_id": chosen_method["id"] if chosen_method else None,
            "expires_at": expires_at.isoformat(),
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
            **order_data
        }

        # Enrich with requisite details for easy UI display
        if chosen_method:
            full_order["bank_name"] = chosen_method.get("bank_name")
            full_order["card_number"] = chosen_method.get("card_number")
            full_order["recipient_name"] = chosen_method.get("recipient_name")
            full_order["payment_instructions"] = chosen_method.get("instructions")

        client = cls.get_client()
        if client:
            try:
                db_payload = {k: v for k, v in full_order.items() if k not in ["bank_name", "card_number", "recipient_name", "payment_instructions", "explorer_url"]}
                res = client.table("orders").insert(db_payload).execute()
                if res.data:
                    return {**full_order, **res.data[0]}
            except Exception:
                pass

        cls._memory_orders[order_id] = full_order
        
        # Add initial system message to chat
        cls._memory_messages.append({
            "id": str(uuid.uuid4()),
            "order_id": order_id,
            "sender_type": "system",
            "sender_name": "Система Escrow KG",
            "message": f"🚀 Заказ #{order_code} успешно создан. Переведите {full_order['fiat_amount']} {full_order['fiat_currency']} на карту оператора в течение 15 минут.",
            "created_at": now.isoformat()
        })
        
        return full_order

    @classmethod
    async def get_order_by_id(cls, order_id: str) -> Optional[Dict[str, Any]]:
        client = cls.get_client()
        if client:
            try:
                # Try finding by ID or Order Code or Secret Token
                res = client.table("orders").select("*, payment_methods(*)").or_(f"id.eq.{order_id},order_code.eq.{order_id},secret_token.eq.{order_id}").execute()
                if res.data and len(res.data) > 0:
                    order = res.data[0]
                    # Flatten payment method
                    pm = order.get("payment_methods")
                    if pm:
                        order["bank_name"] = pm.get("bank_name")
                        order["card_number"] = pm.get("card_number")
                        order["recipient_name"] = pm.get("recipient_name")
                        order["payment_instructions"] = pm.get("instructions")
                    return order
            except Exception:
                pass
        
        # Check memory
        for oid, order in cls._memory_orders.items():
            if oid == order_id or order.get("order_code") == order_id or order.get("secret_token") == order_id:
                return order
        return None

    @classmethod
    async def update_order_status(cls, order_id: str, status: str, extra: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        updates = {"status": status, "updated_at": datetime.utcnow().isoformat()}
        if extra:
            updates.update(extra)

        if status == "PAID_CONFIRMED_BY_USER":
            updates["paid_at"] = datetime.utcnow().isoformat()
        elif status in ("COMPLETED", "USDT_DISPATCHED"):
            updates["completed_at"] = datetime.utcnow().isoformat()

        client = cls.get_client()
        if client:
            try:
                res = client.table("orders").update(updates).eq("id", order_id).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass

        if order_id in cls._memory_orders:
            cls._memory_orders[order_id].update(updates)
            
            # Add automatic message to memory messages
            cls._memory_messages.append({
                "id": str(uuid.uuid4()),
                "order_id": order_id,
                "sender_type": "system",
                "sender_name": "Система Escrow KG",
                "message": f"ℹ️ Статус заказа обновлен: {status}",
                "created_at": datetime.utcnow().isoformat()
            })
            return cls._memory_orders[order_id]
        return None

    @classmethod
    async def list_orders(cls, status: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        client = cls.get_client()
        if client:
            try:
                query = client.table("orders").select("*, payment_methods(*)").order("created_at", desc=True).limit(limit)
                if status:
                    query = query.eq("status", status)
                res = query.execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        
        results = list(cls._memory_orders.values())
        if status:
            results = [o for o in results if o.get("status") == status]
        return sorted(results, key=lambda x: x.get("created_at", ""), reverse=True)[:limit]

    # 4. CHAT MESSAGES
    @classmethod
    async def get_messages(cls, order_id: str) -> List[Dict[str, Any]]:
        client = cls.get_client()
        if client:
            try:
                res = client.table("order_messages").select("*").eq("order_id", order_id).order("created_at", desc=False).execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        
        return [m for m in cls._memory_messages if m.get("order_id") == order_id]

    @classmethod
    async def add_message(cls, order_id: str, sender_type: str, sender_name: str, message: str, attachment_url: Optional[str] = None) -> Dict[str, Any]:
        msg_data = {
            "id": str(uuid.uuid4()),
            "order_id": order_id,
            "sender_type": sender_type,
            "sender_name": sender_name,
            "message": message,
            "attachment_url": attachment_url,
            "created_at": datetime.utcnow().isoformat()
        }

        client = cls.get_client()
        if client:
            try:
                res = client.table("order_messages").insert(msg_data).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass

        cls._memory_messages.append(msg_data)
        return msg_data
