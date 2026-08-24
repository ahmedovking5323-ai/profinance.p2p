from typing import Dict, Any, Optional
from app.schemas.order import CryptoNetwork, FiatCurrency
from app.schemas.rate import RateCalculationResponse, NetworkFeeInfo

class RateEngine:
    # Default fallback data when Supabase is initializing
    DEFAULT_RATES: Dict[str, Dict[str, float]] = {
        "KGS": {
            "base_rate_usd": 87.50,
            "margin_percent": 1.20,
            "min_order_usdt": 20.0,
            "max_order_usdt": 10000.0,
        },
        "USD": {
            "base_rate_usd": 1.00,
            "margin_percent": 1.00,
            "min_order_usdt": 20.0,
            "max_order_usdt": 15000.0,
        }
    }

    DEFAULT_NETWORKS: Dict[str, Dict[str, Any]] = {
        "TRC20": {
            "name": "TRON (TRC-20)",
            "network_fee_usdt": 1.20,
            "est_delivery_minutes": 2,
            "reserve_usdt": 75000.0,
            "explorer_tx_url": "https://tronscan.org/#/transaction/",
            "is_active": True
        },
        "BEP20": {
            "name": "BNB Smart Chain (BEP-20)",
            "network_fee_usdt": 0.40,
            "est_delivery_minutes": 1,
            "reserve_usdt": 50000.0,
            "explorer_tx_url": "https://bscscan.com/tx/",
            "is_active": True
        },
        "ERC20": {
            "name": "Ethereum (ERC-20)",
            "network_fee_usdt": 4.50,
            "est_delivery_minutes": 5,
            "reserve_usdt": 30000.0,
            "explorer_tx_url": "https://etherscan.io/tx/",
            "is_active": True
        },
        "TON": {
            "name": "The Open Network (TON)",
            "network_fee_usdt": 0.25,
            "est_delivery_minutes": 1,
            "reserve_usdt": 40000.0,
            "explorer_tx_url": "https://tonscan.org/tx/",
            "is_active": True
        }
    }

    @classmethod
    def get_effective_rate(cls, base_rate: float, margin_percent: float) -> float:
        """
        Calculates the buy rate including platform margin.
        e.g., If base USD/KGS is 87.50 and margin is 1.2%, effective buy rate = 87.50 * 1.012 = 88.55 KGS per USDT.
        """
        return round(base_rate * (1 + (margin_percent / 100.0)), 4)

    @classmethod
    def calculate(
        cls,
        fiat_currency: FiatCurrency,
        crypto_network: CryptoNetwork,
        fiat_amount: Optional[float] = None,
        crypto_amount: Optional[float] = None,
        rates_override: Optional[Dict[str, Any]] = None,
        network_override: Optional[Dict[str, Any]] = None
    ) -> RateCalculationResponse:
        """
        Calculates exchange amounts, fees, and checks limits.
        """
        currency_key = fiat_currency.value
        rate_info = rates_override or cls.DEFAULT_RATES.get(currency_key, cls.DEFAULT_RATES["KGS"])
        
        base_rate = float(rate_info.get("base_rate_usd", 87.50 if currency_key == "KGS" else 1.00))
        margin_percent = float(rate_info.get("margin_percent", 1.20))
        min_order_usdt = float(rate_info.get("min_order_usdt", 20.0))
        max_order_usdt = float(rate_info.get("max_order_usdt", 10000.0))

        net_info = network_override or cls.DEFAULT_NETWORKS.get(crypto_network.value, cls.DEFAULT_NETWORKS["TRC20"])
        network_fee = float(net_info.get("network_fee_usdt", 1.0))

        effective_rate = cls.get_effective_rate(base_rate, margin_percent)

        if fiat_amount is not None and fiat_amount > 0:
            gross_crypto = fiat_amount / effective_rate
            net_crypto = max(0.0, gross_crypto - network_fee)
            final_fiat = fiat_amount
        elif crypto_amount is not None and crypto_amount > 0:
            net_crypto = crypto_amount
            gross_crypto = net_crypto + network_fee
            final_fiat = gross_crypto * effective_rate
        else:
            # Default to 100 USDT worth
            net_crypto = 100.0
            gross_crypto = net_crypto + network_fee
            final_fiat = gross_crypto * effective_rate

        # Limits validation
        is_within_limits = True
        validation_message = None

        if net_crypto < min_order_usdt:
            is_within_limits = False
            validation_message = f"Минимальная сумма обмена: {min_order_usdt:.2f} USDT"
        elif net_crypto > max_order_usdt:
            is_within_limits = False
            validation_message = f"Максимальная сумма обмена: {max_order_usdt:.2f} USDT"

        return RateCalculationResponse(
            fiat_currency=fiat_currency,
            fiat_amount=round(final_fiat, 2),
            crypto_network=crypto_network,
            crypto_amount=round(net_crypto, 4),
            gross_crypto_amount=round(gross_crypto, 4),
            network_fee_usdt=round(network_fee, 4),
            exchange_rate=round(effective_rate, 4),
            base_rate_usd=round(base_rate, 4),
            margin_percent=round(margin_percent, 2),
            min_order_usdt=min_order_usdt,
            max_order_usdt=max_order_usdt,
            is_within_limits=is_within_limits,
            validation_message=validation_message
        )
