"use client";

import React, { useState, useEffect } from "react";
import { OrderData, confirmOrderPayment } from "@/lib/api";
import { uploadReceiptImage } from "@/lib/supabase";
import {
  Clock,
  Copy,
  Check,
  Upload,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  FileCheck,
  ArrowRight,
  CreditCard,
  Building2,
  Sparkles
} from "lucide-react";
import { formatCurrency, formatCrypto, formatCardNumber, truncateAddress } from "@/lib/utils";

interface OrderTrackerProps {
  order: OrderData;
  onOrderUpdated: (updated: OrderData) => void;
}

const STATUS_STEPS = [
  { key: "AWAITING_PAYMENT", label: "1. Оплата заказа", sub: "Перевод на карту" },
  { key: "PAID_CONFIRMED_BY_USER", label: "2. Проверка чека", sub: "Оператор проверяет" },
  { key: "VERIFIED_BY_ADMIN", label: "3. Одобрено", sub: "Подготовка отправки" },
  { key: "COMPLETED", label: "4. USDT Отправлены", sub: "Зачислено на кошелек" },
];

export function OrderTracker({ order, onOrderUpdated }: OrderTrackerProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 mins default in seconds
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(order.user_receipt_url || null);
  const [bankRefId, setBankRefId] = useState<string>(order.bank_reference_id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [actionError, setActionError] = useState("");

  // Countdown timer logic
  useEffect(() => {
    const calculateRemaining = () => {
      const expires = new Date(order.expires_at).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      setTimeLeft(diff);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [order.expires_at]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleConfirmPaid = async () => {
    setActionError("");
    setIsSubmitting(true);

    try {
      let uploadedUrl = order.user_receipt_url;

      if (receiptFile) {
        setUploadProgress(true);
        const { url, error } = await uploadReceiptImage(receiptFile, order.id);
        uploadedUrl = url;
        setUploadProgress(false);
      }

      const updated = await confirmOrderPayment(order.id, {
        bank_reference_id: bankRefId.trim() || undefined,
        user_receipt_url: uploadedUrl,
      });

      onOrderUpdated(updated);
    } catch (err: any) {
      setActionError(err.message || "Не удалось подтвердить оплату.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(false);
    }
  };

  const isPaid = [
    "PAID_CONFIRMED_BY_USER",
    "VERIFIED_BY_ADMIN",
    "USDT_DISPATCHED",
    "COMPLETED",
  ].includes(order.status);

  const isCompleted = ["USDT_DISPATCHED", "COMPLETED"].includes(order.status);

  const getStepIndex = (status: string) => {
    if (status === "CREATED" || status === "AWAITING_PAYMENT") return 0;
    if (status === "PAID_CONFIRMED_BY_USER") return 1;
    if (status === "VERIFIED_BY_ADMIN") return 2;
    if (status === "USDT_DISPATCHED" || status === "COMPLETED") return 3;
    return 0;
  };

  const currentStep = getStepIndex(order.status);

  return (
    <div className="space-y-6">
      {/* 1. Status Timeline Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Заказ #{order.order_code}
            </span>
            <h1 className="mt-1 text-xl sm:text-2xl font-bold text-white">
              Статус:{" "}
              {order.status === "AWAITING_PAYMENT" && <span className="text-amber-400">Ожидание оплаты</span>}
              {order.status === "PAID_CONFIRMED_BY_USER" && <span className="text-blue-400">Проверка чека оператором</span>}
              {order.status === "VERIFIED_BY_ADMIN" && <span className="text-teal-400">Оплата подтверждена</span>}
              {order.status === "COMPLETED" && <span className="text-emerald-400">Заказ выполнен 🎉</span>}
              {order.status === "CANCELLED" && <span className="text-red-400">Заказ отменен</span>}
            </h1>
          </div>

          {/* Countdown Clock (if awaiting payment) */}
          {order.status === "AWAITING_PAYMENT" && (
            <div className="flex items-center space-x-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-amber-400">
              <Clock className="h-4 w-4 animate-pulse" />
              <div className="text-xs">
                <span className="block font-medium">Осталось времени:</span>
                <span className="font-mono text-base font-black">{formatTimer(timeLeft)}</span>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center space-x-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="h-5 w-5" />
              <span>USDT успешно зачислены</span>
            </div>
          )}
        </div>

        {/* Stepper Bar */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATUS_STEPS.map((step, idx) => {
            const isPassed = currentStep > idx;
            const isCurrent = currentStep === idx;
            return (
              <div
                key={step.key}
                className={`rounded-xl border p-3 transition-all ${
                  isCurrent
                    ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
                    : isPassed
                    ? "border-emerald-500/40 bg-slate-950/60 text-slate-300"
                    : "border-slate-800 bg-slate-950/30 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{step.label}</span>
                  {isPassed && <Check className="h-4 w-4 text-emerald-400" />}
                  {isCurrent && <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">{step.sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Payment Requisites & Instructions */}
      {!isCompleted && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center space-x-2 text-white font-bold">
              <CreditCard className="h-5 w-5 text-emerald-400" />
              <span>Реквизиты для оплаты ({order.fiat_currency})</span>
            </div>
            <span className="text-xs text-slate-400">Перевод на карту КР</span>
          </div>

          <div className="mt-5 space-y-4">
            {/* Amount to pay */}
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div>
                <span className="text-xs text-slate-400">Точная сумма к оплате:</span>
                <div className="text-2xl font-black text-white">
                  {formatCurrency(order.fiat_amount, order.fiat_currency)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(order.fiat_amount.toString(), "amount")}
                className="flex items-center space-x-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                {copiedField === "amount" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copiedField === "amount" ? "Скопировано" : "Копировать"}</span>
              </button>
            </div>

            {/* Card Number */}
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div>
                <span className="text-xs text-slate-400">
                  Банк: <strong className="text-slate-200">{order.bank_name || "MBank (КБ Кыргызстан)"}</strong>
                </span>
                <div className="mt-1 font-mono text-lg sm:text-xl font-bold text-emerald-400">
                  {order.card_number || "0999119118"}
                </div>
                <div className="text-xs text-slate-400">
                  Получатель: <strong className="text-slate-200">{order.recipient_name || "Ахмедов У."}</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(order.card_number || "0999119118", "card")}
                className="flex items-center space-x-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                {copiedField === "card" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedField === "card" ? "Скопировано" : "Скопировать номер"}</span>
              </button>
            </div>

            {/* Reference / Memo */}
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs">
              <div>
                <span className="text-slate-400">Примечание к переводу (в приложении банка):</span>
                <div className="font-mono font-bold text-white">{order.order_code}</div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(order.order_code, "memo")}
                className="flex items-center space-x-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                {copiedField === "memo" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedField === "memo" ? "Скопировано" : "Копировать"}</span>
              </button>
            </div>
          </div>

          {/* 3. Confirm Payment / Receipt Upload (if awaiting payment) */}
          {order.status === "AWAITING_PAYMENT" && (
            <div className="mt-6 border-t border-slate-800/80 pt-6">
              <h3 className="text-sm font-bold text-white">Подтверждение оплаты</h3>
              <p className="text-xs text-slate-400">
                После перевода средств прикрепите скриншот чека или квитанцию из мобильного банка.
              </p>

              {actionError && (
                <div className="mt-3 flex items-center space-x-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Upload receipt */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Скриншот чека / квитанции:
                  </label>
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950 p-4 text-center cursor-pointer hover:border-emerald-500/50 transition-colors">
                    <Upload className="h-6 w-6 text-slate-400" />
                    <span className="mt-2 text-xs font-medium text-slate-300">
                      {receiptFile ? receiptFile.name : "Выбрать файл (JPG, PNG, PDF)"}
                    </span>
                    <span className="text-[10px] text-slate-500">до 10 МБ</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Bank Ref ID input */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Код транзакции / квитанции (необязательно):
                  </label>
                  <input
                    type="text"
                    value={bankRefId}
                    onChange={(e) => setBankRefId(e.target.value)}
                    placeholder="Например: MB-984210"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                  <div className="mt-2 text-[11px] text-slate-400">
                    Помогает оператору моментально идентифицировать ваш платеж.
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmPaid}
                className="mt-5 w-full flex items-center justify-center space-x-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl shadow-emerald-500/25 hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{uploadProgress ? "Загрузка чека..." : "Отправка подтверждения..."}</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4" />
                    <span>Я оплатил заказ</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. On-Chain USDT Dispatch Details (When Completed) */}
      {isCompleted && (
        <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/90 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <Sparkles className="h-5 w-5" />
            <span>Криптовалюта отправлена в блокчейн</span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-sm">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Получатель ({order.crypto_network}):</span>
                <span className="font-mono text-slate-200">{truncateAddress(order.wallet_address, 10, 8)}</span>
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>Зачислено:</span>
                <span className="font-bold text-emerald-400 text-base">{formatCrypto(order.crypto_amount, "USDT")}</span>
              </div>
            </div>

            {order.tx_hash && (
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs">
                <div>
                  <span className="text-slate-400">Хеш транзакции (TX Hash):</span>
                  <div className="font-mono font-bold text-slate-200 mt-0.5">
                    {truncateAddress(order.tx_hash, 12, 10)}
                  </div>
                </div>

                <a
                  href={`${order.explorer_url || "https://tronscan.org/#/transaction/"}${order.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  <span>Проверить в обозревателе</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
