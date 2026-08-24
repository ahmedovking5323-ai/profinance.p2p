"use client";

import React from "react";
import { ShieldCheck, Zap, Award, Star, CheckCircle, Lock, RefreshCw, Wallet } from "lucide-react";

const REVIEWS = [
  {
    name: "Азамат Т.",
    city: "Бишкек",
    network: "TRC-20",
    amount: "500 USDT",
    text: "Покупал через MBank, USDT поступили на кошелек Trust Wallet буквально через 2 минуты. Отличный курс без скрытых сборов!",
    rating: 5,
    date: "Сегодня",
  },
  {
    name: "Данияр К.",
    city: "Ош",
    network: "BEP-20",
    amount: "1,200 USDT",
    text: "Постоянно беру USDT для торговли. Оплачиваю с карты Оптима Банк, чек проверяют за минуту. Рекомендую всем в КР.",
    rating: 5,
    date: "Вчера",
  },
  {
    name: "Айсулуу М.",
    city: "Бишкек",
    network: "TON",
    amount: "250 USDT",
    text: "Быстро купила USDT прямо в Telegram Wallet через TON сеть. Комиссия всего $0.25! Очень удобно.",
    rating: 5,
    date: "2 дня назад",
  },
];

const RESERVES_DATA = [
  { name: "TRON (TRC-20)", reserve: "75,000 USDT", speed: "1-2 мин", status: "В наличии" },
  { name: "BNB Smart Chain (BEP-20)", reserve: "50,000 USDT", speed: "1 мин", status: "В наличии" },
  { name: "The Open Network (TON)", reserve: "40,000 USDT", speed: "30 сек", status: "В наличии" },
  { name: "Ethereum (ERC-20)", reserve: "30,000 USDT", speed: "3-5 мин", status: "В наличии" },
];

export function TrustBadges() {
  return (
    <div className="space-y-16 py-12">
      {/* 1. Key Platform Advantages */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Молниеносный обмен</h3>
            <p className="mt-1 text-xs text-slate-400">
              Среднее время от подтверждения оплаты до поступления USDT на кошелек — 120 секунд.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">100% P2P Эскроу Гарантия</h3>
            <p className="mt-1 text-xs text-slate-400">
              Криптовалюта замораживается на смарт-балансе до успешного подтверждения банком.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Все банки Кыргызстана</h3>
            <p className="mt-1 text-xs text-slate-400">
              Оплата через MBank, Optima, Demir, Bakai, Elkart, Visa и Mastercard в сомах (KGS) и USD.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Конфиденциально</h3>
            <p className="mt-1 text-xs text-slate-400">
              Не требуем сложной верификации и фото с паспортом для разовых покупок до 10,000 USDT.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Live USDT Reserves Display */}
      <section id="reserves" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Прямой ликвидный пул
                </span>
              </div>
              <h2 className="mt-1 text-xl sm:text-2xl font-bold text-white">
                Текущие резервы USDT в Кыргызстане
              </h2>
            </div>
            <span className="mt-2 sm:mt-0 text-xs text-slate-400">Общий резерв: &gt; $195,000 USDT</span>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RESERVES_DATA.map((res) => (
              <div key={res.name} className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">{res.name}</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    {res.status}
                  </span>
                </div>
                <div className="mt-2 text-xl font-extrabold text-white">{res.reserve}</div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Скорость сети:</span>
                  <span className="text-emerald-400 font-medium">{res.speed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Customer Reviews */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Отзывы клиентов из Кыргызстана</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Более 15,000 успешных сделок по обмену Tether USDT в Бишкеке, Оше и регионах КР.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {REVIEWS.map((rev, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm"
            >
              <div>
                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-300">“{rev.text}”</p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                <div>
                  <div className="font-bold text-white">{rev.name}</div>
                  <div className="text-[11px] text-slate-500">г. {rev.city}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-emerald-400">{rev.amount}</div>
                  <div className="text-[10px] text-slate-500">{rev.network}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
