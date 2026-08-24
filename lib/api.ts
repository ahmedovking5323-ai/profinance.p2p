import { CryptoNetwork } from "./validation";

export type FiatCurrency = "KGS" | "USD";

export interface RateCalculationResult {
  fiat_currency: FiatCurrency;
  fiat_amount: number;
  crypto_network: CryptoNetwork;
  crypto_amount: number;
  gross_crypto_amount: number;
  network_fee_usdt: number;
  exchange_rate: number;
  base_rate_usd: number;
  margin_percent: number;
  min_order_usdt: number;
  max_order_usdt: number;
  is_within_limits: boolean;
  validation_message?: string;
}

export interface NetworkFeeInfo {
  network: CryptoNetwork;
  name: string;
  network_fee_usdt: number;
  est_delivery_minutes: number;
  reserve_usdt: number;
  is_active: boolean;
  explorer_tx_url: string;
}

export interface OrderData {
  id: string;
  order_code: string;
  secret_token: string;
  fiat_currency: FiatCurrency;
  fiat_amount: number;
  crypto_network: CryptoNetwork;
  crypto_amount: number;
  exchange_rate: number;
  network_fee_usdt: number;
  wallet_address: string;
  buyer_contact: string;
  buyer_name?: string;
  status: "CREATED" | "AWAITING_PAYMENT" | "PAID_CONFIRMED_BY_USER" | "VERIFIED_BY_ADMIN" | "USDT_DISPATCHED" | "COMPLETED" | "CANCELLED";
  payment_method_id?: string;
  user_receipt_url?: string;
  bank_reference_id?: string;
  tx_hash?: string;
  admin_notes?: string;
  expires_at: string;
  paid_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  bank_name?: string;
  card_number?: string;
  recipient_name?: string;
  payment_instructions?: string;
  explorer_url?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1` : "/api/py";

export async function calculateExchangeRate(params: {
  fiat_currency: FiatCurrency;
  fiat_amount?: number;
  crypto_amount?: number;
  crypto_network: CryptoNetwork;
}): Promise<RateCalculationResult> {
  try {
    const res = await fetch(`${API_BASE}/rates/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Local fallback calculation engine
  }

  // Client-side fallback calculation
  const baseRate = params.fiat_currency === "KGS" ? 87.50 : 1.00;
  const margin = params.fiat_currency === "KGS" ? 1.20 : 1.00;
  const effectiveRate = Number((baseRate * (1 + margin / 100)).toFixed(4));
  
  const fees: Record<CryptoNetwork, number> = {
    TRC20: 1.20,
    BEP20: 0.40,
    ERC20: 4.50,
    TON: 0.25
  };
  const networkFee = fees[params.crypto_network] || 1.00;

  let fiatAmount = params.fiat_amount || 0;
  let netCrypto = params.crypto_amount || 0;

  if (params.fiat_amount && params.fiat_amount > 0) {
    const gross = params.fiat_amount / effectiveRate;
    netCrypto = Math.max(0, gross - networkFee);
  } else if (params.crypto_amount && params.crypto_amount > 0) {
    const gross = params.crypto_amount + networkFee;
    fiatAmount = gross * effectiveRate;
  } else {
    netCrypto = 100;
    fiatAmount = (100 + networkFee) * effectiveRate;
  }

  const minUsdt = 20;
  const maxUsdt = 10000;
  const isWithin = netCrypto >= minUsdt && netCrypto <= maxUsdt;

  return {
    fiat_currency: params.fiat_currency,
    fiat_amount: Number(fiatAmount.toFixed(2)),
    crypto_network: params.crypto_network,
    crypto_amount: Number(netCrypto.toFixed(4)),
    gross_crypto_amount: Number((netCrypto + networkFee).toFixed(4)),
    network_fee_usdt: networkFee,
    exchange_rate: effectiveRate,
    base_rate_usd: baseRate,
    margin_percent: margin,
    min_order_usdt: minUsdt,
    max_order_usdt: maxUsdt,
    is_within_limits: isWithin,
    validation_message: isWithin ? undefined : `Сумма обмена должна быть от ${minUsdt} до ${maxUsdt} USDT.`,
  };
}

export async function createNewOrder(data: {
  fiat_currency: FiatCurrency;
  fiat_amount: number;
  crypto_network: CryptoNetwork;
  wallet_address: string;
  buyer_contact: string;
  buyer_name?: string;
}): Promise<OrderData> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Ошибка при создании заявки" }));
    throw new Error(err.detail || "Ошибка при создании заявки");
  }

  return await res.json();
}

export async function fetchOrderDetails(orderId: string): Promise<OrderData> {
  const res = await fetch(`${API_BASE}/orders/${orderId}`);
  if (!res.ok) {
    throw new Error("Заказ не найден");
  }
  return await res.json();
}

export async function confirmOrderPayment(
  orderId: string,
  payload: { bank_reference_id?: string; user_receipt_url?: string }
): Promise<OrderData> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/confirm-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Ошибка подтверждения" }));
    throw new Error(err.detail || "Ошибка подтверждения оплаты");
  }

  return await res.json();
}

export async function fetchOrderMessages(orderId: string) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/messages`);
  if (!res.ok) return [];
  return await res.json();
}

export async function sendChatMessage(orderId: string, payload: {
  sender_type: "buyer" | "admin" | "system";
  sender_name: string;
  message: string;
  attachment_url?: string;
}) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Не удалось отправить сообщение");
  return await res.json();
}
