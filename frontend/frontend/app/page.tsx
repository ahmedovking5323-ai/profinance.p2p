import React from "react";
import { ExchangeCalculator } from "@/components/ExchangeCalculator";
import { TrustBadges } from "@/components/TrustBadges";
import { FaqSection } from "@/components/FaqSection";
import { ShieldCheck, Zap, ArrowRight, CheckCircle2, Building2, CreditCard, Sparkles, Lock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Background Elements */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-600/10 blur-[120px]"></div>
      <div className="pointer-events-none absolute top-96 right-10 -z-10 h-[400px] w-[400px] rounded-full bg-teal-500/10 blur-[100px]"></div>

      {/* 1. Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-6 sm:px-6 sm:pt-14 lg:px-8 text-center">
        {/* Brand Logo Card in Hero */}
        <div className="mx-auto mb-7 flex max-w-sm sm:max-w-xl items-center justify-center overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-2xl shadow-emerald-500/25 border border-slate-600/70 hover:scale-[1.02] transition-transform">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="PROFINANCE Currency Exchange"
            className="h-20 sm:h-28 w-auto object-contain"
          />
        </div>

        <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>PROFINANCE — №1 Сервис обмена валют и USDT в Кыргызстане</span>
        </div>

        <h1 className="mx-auto mt-6 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
          Купить <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">USDT Tether</span> за Сомы (KGS) и Доллары в Бишкеке
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-400 leading-relaxed">
          Моментальный обмен через MBank, Optima Bank, DemirBank, Bakai и любые карты Visa/Mastercard. Поддержка сетей TRC-20, BEP-20, TON и ERC-20 с автоматическим эскроу-депозитом.
        </p>

        {/* Kyrgyz Bank Logos Strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400">
          <span className="flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 font-medium text-slate-300">
            🟢 <strong>MBank</strong>
          </span>
          <span className="flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 font-medium text-slate-300">
            🔴 <strong>Optima Bank</strong>
          </span>
          <span className="flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 font-medium text-slate-300">
            🔵 <strong>DemirBank</strong>
          </span>
          <span className="flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 font-medium text-slate-300">
            💳 <strong>Visa / Mastercard КР</strong>
          </span>
        </div>
      </section>

      {/* 2. Live Exchange Calculator */}
      <ExchangeCalculator />

      {/* 3. How It Works (3 Steps) */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Прозрачный процесс
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
            Как купить USDT за 3 простых шага
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Без сложной регистрации и ожидания — всё происходит в автоматическом режиме.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Step 1 */}
          <div className="relative rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 font-extrabold text-lg border border-emerald-500/20">
              1
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Рассчитайте сумму</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Укажите желаемую сумму в сомах или долларах, выберите сеть (TRC20, BEP20, TON, ERC20) и введите ваш криптокошелек.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 font-extrabold text-lg border border-teal-500/20">
              2
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Переведите оплату</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Отправьте KGS/USD со своего приложения MBank или Optima на выданные реквизиты и прикрепите чек на странице заказа.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 font-extrabold text-lg border border-cyan-500/20">
              3
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Получите USDT</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              После моментальной сверки чека эскроу-депозит переводит USDT на ваш адрес. Хеш транзакции отображается онлайн.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Trust Badges & Reserves */}
      <TrustBadges />

      {/* 5. SEO FAQs */}
      <FaqSection />
    </div>
  );
}
