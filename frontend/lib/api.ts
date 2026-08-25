import { CryptoNetwork } from "./validation";
import { supabase } from "./supabase";

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

const EXPLORERS: Record<CryptoNetwork, string> = {
  TRC20: "https://tronscan.org/#/transaction/",
  BEP20: "https://bscscan.com/tx/",
  ERC20: "https://etherscan.io/tx/",
  TON: "https://tonscan.org/tx/",
};

export async function calculateExchangeRate(params: {
  fiat_currency: FiatCurrency;
  fiat_amount?: number;
  crypto_amount?: number;
  crypto_network: CryptoNetwork;
}): Promise<RateCalculationResult> {
  let baseRate = params.fiat_currency === "KGS" ? 87.50 : 1.00;
  let margin = params.fiat_currency === "KGS" ? 1.20 : 1.00;

  // Try fetching live rates from Supabase
  try {
    const { data: rateData } = await supabase
      .from("rates_config")
      .select("*")
      .eq("fiat_currency", params.fiat_currency)
      .single();

    if (rateData) {
      baseRate = Number(rateData.base_rate_usd);
      margin = Number(rateData.margin_percent);
    }
  } catch (e) {
    // fallback to defaults
  }

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
  const calc = await calculateExchangeRate({
    fiat_currency: data.fiat_currency,
    fiat_amount: data.fiat_amount,
    crypto_network: data.crypto_network,
  });

  // Fetch active payment method from Supabase
  let paymentMethodId = null;
  let bankName = "MBank (КБ Кыргызстан)";
  let cardNumber = "0999119118";
  let recipientName = "Ахмедов У.";
  let paymentInstructions = "Перевод по номеру телефона или через MBank: 0999119118 (Ахмедов У.). В комментарии укажите номер заказа.";

  try {
    const { data: pmList } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("currency", data.fiat_currency)
      .eq("is_active", true)
      .limit(1);

    if (pmList && pmList.length > 0) {
      const pm = pmList[0];
      paymentMethodId = pm.id;
      bankName = pm.bank_name;
      cardNumber = pm.card_number;
      recipientName = pm.recipient_name;
      paymentInstructions = pm.instructions;
    }
  } catch (e) {
    console.warn("Using default payment method info", e);
  }

  const orderCode = `KG-${Math.floor(10000 + Math.random() * 90000)}`;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const newOrderPayload = {
    order_code: orderCode,
    fiat_currency: data.fiat_currency,
    fiat_amount: calc.fiat_amount,
    crypto_network: data.crypto_network,
    crypto_amount: calc.crypto_amount,
    exchange_rate: calc.exchange_rate,
    network_fee_usdt: calc.network_fee_usdt,
    wallet_address: data.wallet_address.trim(),
    buyer_contact: data.buyer_contact.trim(),
    buyer_name: data.buyer_name || null,
    status: "AWAITING_PAYMENT",
    payment_method_id: paymentMethodId,
    expires_at: expiresAt,
  };

  const { data: createdOrder, error } = await supabase
    .from("orders")
    .insert(newOrderPayload)
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error(error.message || "Ошибка при создании заявки");
  }

  return {
    ...createdOrder,
    bank_name: bankName,
    card_number: cardNumber,
    recipient_name: recipientName,
    payment_instructions: paymentInstructions,
    explorer_url: EXPLORERS[data.crypto_network],
  };
}

export async function fetchOrderDetails(orderId: string): Promise<OrderData> {
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, payment_methods(*)")
    .or(`id.eq.${orderId},order_code.eq.${orderId},secret_token.eq.${orderId}`)
    .single();

  if (error || !order) {
    throw new Error("Заказ не найден");
  }

  const pm = order.payment_methods;
  return {
    ...order,
    bank_name: pm?.bank_name || "MBank (КБ Кыргызстан)",
    card_number: pm?.card_number || "0999119118",
    recipient_name: pm?.recipient_name || "Ахмедов У.",
    payment_instructions: pm?.instructions || "Перевод по номеру телефона: 0999119118 (Ахмедов У.)",
    explorer_url: EXPLORERS[order.crypto_network as CryptoNetwork] || "https://tronscan.org/#/transaction/",
  };
}

export async function confirmOrderPayment(
  orderId: string,
  payload: { bank_reference_id?: string; user_receipt_url?: string }
): Promise<OrderData> {
  const updatePayload: Record<string, any> = {
    status: "PAID_CONFIRMED_BY_USER",
    paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (payload.bank_reference_id) {
    updatePayload.bank_reference_id = payload.bank_reference_id;
  }
  if (payload.user_receipt_url) {
    updatePayload.user_receipt_url = payload.user_receipt_url;
  }

  const { data: updated, error } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", orderId)
    .select("*, payment_methods(*)")
    .single();

  if (error) {
    throw new Error(error.message || "Ошибка подтверждения оплаты");
  }

  const pm = updated.payment_methods;
  return {
    ...updated,
    bank_name: pm?.bank_name || "MBank (КБ Кыргызстан)",
    card_number: pm?.card_number || "0999119118",
    recipient_name: pm?.recipient_name || "Ахмедов У.",
    payment_instructions: pm?.instructions,
    explorer_url: EXPLORERS[updated.crypto_network as CryptoNetwork],
  };
}

export async function fetchOrderMessages(orderId: string) {
  const { data: messages, error } = await supabase
    .from("order_messages")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return messages || [];
}

export async function sendChatMessage(orderId: string, payload: {
  sender_type: "buyer" | "admin" | "system";
  sender_name: string;
  message: string;
  attachment_url?: string;
}) {
  const { data, error } = await supabase
    .from("order_messages")
    .insert({
      order_id: orderId,
      sender_type: payload.sender_type,
      sender_name: payload.sender_name,
      message: payload.message,
      attachment_url: payload.attachment_url || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message || "Не удалось отправить сообщение");
  return data;
}
