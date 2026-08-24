"use client";

import React, { useState, useEffect } from "react";
import { CryptoNetwork } from "@/lib/validation";
import { FiatCurrency, RateCalculationResult, calculateExchangeRate } from "@/lib/api";
import { NetworkSelector } from "./NetworkSelector";
import { OrderFormModal } from "./OrderFormModal";
import { ArrowDownUp, ShieldCheck, Zap, RefreshCw, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { formatCurrency, formatCrypto } from "@/lib/utils";

const KGS_PRESETS = [5000, 10000, 25000, 50000, 100000];
const USD_PRESETS = [100, 300, 500, 1000, 2500];

export function ExchangeCalculator() {
  const [fiatCurrency, setFiatCurrency] = useState<FiatCurrency>("KGS");
  const [fiatAmount, setFiatAmount] = useState<string>("10000");
  const [cryptoNetwork, setCryptoNetwork] = useState<CryptoNetwork>("TRC20");
  
  const [calcResult, setCalcResult] = useState<RateCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Recalculate on inputs change
  useEffect(() => {
    let isCancelled = false;
    const numAmount = parseFloat(fiatAmount) || 0;

    const doCalc = async () => {
      setIsCalculating(true);
      try {
        const result = await calculateExchangeRate({
          fiat_currency: fiatCurrency,
          fiat_amount: numAmount,
          crypto_network: cryptoNetwork,
        });
        if (!isCancelled) {
          setCalcResult(result);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!isCancelled) setIsCalculating(false);
      }
    };

    const timer = setTimeout(doCalc, 200);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [fiatCurrency, fiatAmount, cryptoNetwork]);

  const handleCurrencyChange = (newCurr: FiatCurrency) => {
    setFiatCurrency(newCurr);
    setFiatAmount(newCurr === "KGS" ? "10000" : "200");
  };

  const handlePresetClick = (amount: number) => {
    setFiatAmount(amount.toString());
  };

  return (
    <section id="calculator" className="relative py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 backdrop-blur-xl">
          {/* Subtle Top Glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl"></div>

          {/* Section Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="mr-1 h-3 w-3" /> Лучший курс в Бишкеке
                </span>
                <span className="text-xs text-slate-400">Без скрытых комиссий</span>
              </div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Калькулятор покупки USDT
              </h2>
            </div>

            {/* Currency Switcher Tabs */}
            <div className="mt-4 sm:mt-0 flex rounded-xl border border-slate-800 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => handleCurrencyChange("KGS")}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                  fiatCurrency === "KGS"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🇰🇬 KGS (Сом)
              </button>
              <button
                type="button"
                onClick={() => handleCurrencyChange("USD")}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                  fiatCurrency === "USD"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🇺🇸 USD ($)
              </button>
            </div>
          </div>

          {/* Inputs Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left: You Pay (Fiat) */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Вы отдаете (Перевод с карты):</span>
                <span className="text-emerald-400">Visa / Mastercard / MBank</span>
              </div>

              <div className="mt-3 relative flex items-center">
                <input
                  type="number"
                  min="500"
                  step="100"
                  value={fiatAmount}
                  onChange={(e) => setFiatAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3.5 text-2xl sm:text-3xl font-bold text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="0"
                />
                <div className="absolute right-3 flex items-center space-x-1.5 rounded-lg bg-slate-800/80 px-2.5 py-1 text-sm font-bold text-slate-200">
                  <span>{fiatCurrency}</span>
                </div>
              </div>

              {/* Preset Chips */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(fiatCurrency === "KGS" ? KGS_PRESETS : USD_PRESETS).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePresetClick(p)}
                    className="rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800 transition-colors"
                  >
                    +{p.toLocaleString()} {fiatCurrency}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: You Receive (USDT) */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Вы получаете на кошелек:</span>
                <span className="flex items-center text-slate-400">
                  {isCalculating && <RefreshCw className="mr-1 h-3 w-3 animate-spin text-emerald-400" />}
                  Tether (USDT)
                </span>
              </div>

              <div className="mt-3 relative flex items-center">
                <div className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3.5 text-2xl sm:text-3xl font-bold text-emerald-400">
                  {calcResult ? calcResult.crypto_amount.toFixed(2) : "0.00"}
                </div>
                <div className="absolute right-3 flex items-center space-x-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-sm font-bold text-emerald-300">
                  <span>USDT</span>
                </div>
              </div>

              {/* Rate & Fee Details */}
              <div className="mt-3 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Обменный курс:</span>
                  <span className="font-semibold text-slate-200">
                    1 USDT ≈ {calcResult ? calcResult.exchange_rate : "88.55"} {fiatCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Комиссия сети ({cryptoNetwork}):</span>
                  <span className="font-semibold text-slate-200">
                    -${calcResult ? calcResult.network_fee_usdt.toFixed(2) : "1.20"} USDT
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Network Selection */}
          <div className="mt-6">
            <NetworkSelector
              selectedNetwork={cryptoNetwork}
              onSelect={(net) => setCryptoNetwork(net)}
            />
          </div>

          {/* CTA Action Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80 pt-6">
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span>
                Сделка защищена автоматическим P2P эскроу-депозитом. Время выполнения ~2 минуты.
              </span>
            </div>

            <button
              type="button"
              disabled={!calcResult || !calcResult.is_within_limits}
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto flex-shrink-0 rounded-xl bg-emerald-500 px-8 py-3.5 text-center text-sm font-extrabold text-slate-950 shadow-xl shadow-emerald-500/25 hover:bg-emerald-400 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              Купить USDT сейчас →
            </button>
          </div>
        </div>
      </div>

      {/* Order Creation Modal */}
      {calcResult && (
        <OrderFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          calcResult={calcResult}
        />
      )}
    </section>
  );
}
