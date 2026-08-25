"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Zap, Globe, ArrowRight, Lock } from "lucide-react";

export function Navbar() {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Bishkek",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      setTimeStr(new Intl.DateTimeFormat("ru-RU", options).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      {/* Top Banner: Rate ticker & City Time */}
      <div className="border-b border-slate-900 bg-slate-900/60 px-4 py-1.5 text-xs text-slate-400">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-emerald-400 font-medium">
              <span className="relative mr-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Онлайн обмен 24/7
            </span>
            <span className="hidden sm:inline-block text-slate-600">|</span>
            <span className="hidden sm:inline-block">
              Курс: <strong className="text-slate-200">1 USDT = 88.55 KGS</strong> (MBank / Optima)
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-slate-400">
              Бишкек: <strong className="text-slate-200">{timeStr || "--:--:--"}</strong> (GMT+6)
            </span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative flex h-11 w-36 sm:w-44 items-center justify-center overflow-hidden rounded-xl bg-white/95 p-1 shadow-lg shadow-emerald-500/10 border border-slate-700/50 group-hover:scale-105 transition-transform">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="PROFINANCE Currency Exchange"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="hidden lg:block">
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
              P2P Escrow
            </span>
            <p className="text-[11px] text-slate-400">Обмен валют и USDT</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
          <a href="#calculator" className="hover:text-emerald-400 transition-colors">
            Калькулятор
          </a>
          <a href="#networks" className="hover:text-emerald-400 transition-colors">
            Сети и Комиссии
          </a>
          <a href="#reserves" className="hover:text-emerald-400 transition-colors">
            Резервы
          </a>
          <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
            Как купить
          </a>
          <a href="#faq" className="hover:text-emerald-400 transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin"
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 transition-colors"
            title="Панель оператора"
          >
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Оператор</span>
          </Link>

          <a
            href="#calculator"
            className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all"
          >
            <span>Купить USDT</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
