"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Как купить USDT в Бишкеке и по всему Кыргызстану онлайн?",
    answer:
      "Выберите сумму в сомах (KGS) или долларах (USD) на нашем калькуляторе, укажите сеть (TRC-20, BEP-20, TON или ERC-20) и адрес вашего криптокошелька. После создания заказа переведите средства на указанную карту MBank, Optima или DemirBank и прикрепите чек. USDT поступят на ваш кошелек в течение 1-3 минут.",
  },
  {
    question: "Какие банки Кыргызстана поддерживаются для оплаты?",
    answer:
      "Мы принимаем платежи со всех банков Кыргызстана: MBank (КБ Кыргызстан), Optima Bank, DemirBank, Bakai Bank, KICB, Банк Азии, Компаньон, а также любые карты Visa, Mastercard и Elkart.",
  },
  {
    question: "Какую сеть выбрать: TRC-20, BEP-20, TON или ERC-20?",
    answer:
      "Для минимальных комиссий ($0.25 - $0.40) и высокой скорости выбирайте TON (для Telegram Wallet / Tonkeeper) или BEP-20 (Binance Smart Chain). TRC-20 (Tron) — самый популярный стандарт для бирж и обменников. ERC-20 (Ethereum) подходит для крупных переводов на смарт-контракты.",
  },
  {
    question: "Как гарантируется безопасность средств при P2P обмене?",
    answer:
      "Все сделки защищены системой P2P Escrow. Когда вы создаете заказ, соответствующий объем USDT замораживается в пуле ликвидности. После проверки квитанции оператором криптовалюта автоматически отправляется на ваш кошелек с предоставлением хеша транзакции в блокчейне.",
  },
  {
    question: "Требуется ли верификация личности или паспорт?",
    answer:
      "Для стандартных розничных покупок до $10,000 в сутки регистрация и отправка паспорта не требуются. Достаточно указать ваш контактный номер телефона или логин Telegram для координации заявки.",
  },
  {
    question: "Что делать, если я случайно отправил неверную сумму или ошибся в кошельке?",
    answer:
      "На странице вашего заказа работает Realtime чат с дежурным оператором. Сразу напишите в чат и прикрепите квитанцию. Оператор скорректирует заказ или вернет средства на карту отправителя.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
          Частые вопросы
        </span>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
          Все, что нужно знать о покупке USDT в Кыргызстане
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Ответы на популярные вопросы о курсе, сетях и банковских переводах в сомах и долларах.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-white hover:text-emerald-400 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-emerald-400" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-slate-800/80 px-5 pb-5 pt-3 text-xs leading-relaxed text-slate-300">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
