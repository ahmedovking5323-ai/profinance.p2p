"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CryptoNetwork, validateWalletAddress } from "@/lib/validation";
import { FiatCurrency, createNewOrder, RateCalculationResult } from "@/lib/api";
import { X, ShieldCheck, ArrowRight, Loader2, AlertCircle, Wallet, Phone, User, Building2 } from "lucide-react";
import { formatCurrency, formatCrypto } from "@/lib/utils";

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  calcResult: RateCalculationResult;
}

const KYRGYZ_BANKS = [
  { id: "mbank", name: "MBank (Коммерческий банк КЫРГЫЗСТАН)", icon: "🟢", desc: "Моментальный перевод по номеру или карте" },
  { id: "optima", name: "Optima Bank (Оптима)", icon: "🔴", desc: "Visa / Optima24 перевод" },
  { id: "demir", name: "DemirBank (Демир Банк)", icon: "🔵", desc: "KGS / USD Visa перевод" },
  { id: "bakai", name: "Bakai Bank (Бакай Банк)", icon: "🟡", desc: "Bakai24 / перевод по карте" },
  { id: "any_card", name: "Любая карта Visa / Mastercard КР", icon: "💳", desc: "Межбанковский перевод" },
];

export function OrderFormModal({ isOpen, onClose, calcResult }: OrderFormModalProps) {
  const router = useRouter();

  const [walletAddress, setWalletAddress] = useState("");
  const [buyerContact, setBuyerContact] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [selectedBank, setSelectedBank] = useState("mbank");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // 1. Validate wallet address
    const valResult = validateWalletAddress(calcResult.crypto_network, walletAddress);
    if (!valResult.isValid) {
      setErrorMessage(valResult.message);
      return;
    }

    // 2. Validate contact
    if (!buyerContact.trim() || buyerContact.trim().length < 4) {
      setErrorMessage("Укажите ваш номер телефона (+996...) или Telegram (@username) для связи.");
      return;
    }

    try {
      setLoading(true);
      const newOrder = await createNewOrder({
        fiat_currency: calcResult.fiat_currency,
        fiat_amount: calcResult.fiat_amount,
        crypto_network: calcResult.crypto_network,
        wallet_address: walletAddress.trim(),
        buyer_contact: buyerContact.trim(),
        buyer_name: buyerName.trim() || undefined,
      });

      // Redirect to order page
      router.push(`/order/${newOrder.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Не удалось создать заявку. Попробуйте еще раз.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-emerald-500/10 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Оформление P2P сделки</span>
          </div>
          <h3 className="mt-1 text-xl font-bold text-white">Реквизиты получателя</h3>
          <p className="text-xs text-slate-400">
            Средства резервируются в смарт-эскроу на время проведения платежа.
          </p>
        </div>

        {/* Order Summary Strip */}
        <div className="mb-5 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Вы отдаете:</span>
            <span>Вы получаете:</span>
          </div>
          <div className="mt-1 flex items-center justify-between font-bold">
            <span className="text-white text-base">
              {formatCurrency(calcResult.fiat_amount, calcResult.fiat_currency)}
            </span>
            <ArrowRight className="h-4 w-4 text-emerald-400" />
            <span className="text-emerald-400 text-base">
              {formatCrypto(calcResult.crypto_amount, "USDT")}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
            <span>Сеть: <strong className="text-slate-200">{calcResult.crypto_network}</strong></span>
            <span>Курс: <strong className="text-slate-200">1 USDT = {calcResult.exchange_rate} {calcResult.fiat_currency}</strong></span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 flex items-start space-x-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Destination Wallet */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="flex items-center space-x-1.5">
                <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                <span>Ваш USDT ({calcResult.crypto_network}) адрес кошелька *</span>
              </span>
              <span className="text-[10px] text-slate-400">Куда отправить крипту</span>
            </label>
            <input
              type="text"
              required
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder={
                calcResult.crypto_network === "TRC20"
                  ? "T..."
                  : calcResult.crypto_network === "TON"
                  ? "EQ..."
                  : "0x..."
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 font-mono text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Contact Details */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="flex items-center space-x-1.5">
                <Phone className="h-3.5 w-3.5 text-emerald-400" />
                <span>Телефон / Telegram / WhatsApp *</span>
              </span>
              <span className="text-[10px] text-slate-400">Для связи по сделке</span>
            </label>
            <input
              type="text"
              required
              value={buyerContact}
              onChange={(e) => setBuyerContact(e.target.value)}
              placeholder="+996 555 000 000 или @telegram_tag"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Buyer Name (Optional) */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="flex items-center space-x-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Имя отправителя (как в приложении банка)</span>
              </span>
              <span className="text-[10px] text-slate-500">Необязательно</span>
            </label>
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Например: Азамат Б."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Bank Selection */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-200">
              Способ оплаты в Кыргызстане:
            </label>
            <div className="space-y-1.5">
              {KYRGYZ_BANKS.map((b) => (
                <label
                  key={b.id}
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-xs cursor-pointer transition-all ${
                    selectedBank === b.id
                      ? "border-emerald-500 bg-slate-950 ring-1 ring-emerald-500/50"
                      : "border-slate-800/80 bg-slate-950/40 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="radio"
                      name="bank"
                      value={b.id}
                      checked={selectedBank === b.id}
                      onChange={() => setSelectedBank(b.id)}
                      className="text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-200">{b.name}</div>
                      <div className="text-[10px] text-slate-400">{b.desc}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center space-x-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Создание безопасного заказа...</span>
              </>
            ) : (
              <>
                <span>Перейти к оплате</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
