"use client";

import React from "react";
import { CryptoNetwork } from "@/lib/validation";
import { Zap, ShieldCheck, Flame, Cpu } from "lucide-react";

interface NetworkOption {
  id: CryptoNetwork;
  name: string;
  chain: string;
  feeUsdt: number;
  speed: string;
  badge?: string;
  badgeColor?: string;
  colorClass: string;
  borderClass: string;
}

const NETWORKS: NetworkOption[] = [
  {
    id: "TRC20",
    name: "TRON",
    chain: "TRC-20",
    feeUsdt: 1.2,
    speed: "~1-2 мин",
    badge: "Самый популярный",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
    colorClass: "from-red-500/20 to-orange-500/10",
    borderClass: "border-red-500/40",
  },
  {
    id: "BEP20",
    name: "BNB Chain",
    chain: "BEP-20",
    feeUsdt: 0.4,
    speed: "~1 мин",
    badge: "Низкая комиссия",
    badgeColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    colorClass: "from-yellow-500/20 to-amber-500/10",
    borderClass: "border-yellow-500/40",
  },
  {
    id: "TON",
    name: "TON Network",
    chain: "Telegram TON",
    feeUsdt: 0.25,
    speed: "~30 сек",
    badge: "Молниеносно",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    colorClass: "from-blue-500/20 to-cyan-500/10",
    borderClass: "border-blue-500/40",
  },
  {
    id: "ERC20",
    name: "Ethereum",
    chain: "ERC-20",
    feeUsdt: 4.5,
    speed: "~3-5 мин",
    badge: "Макс. Безопасность",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    colorClass: "from-purple-500/20 to-indigo-500/10",
    borderClass: "border-purple-500/40",
  },
];

interface NetworkSelectorProps {
  selectedNetwork: CryptoNetwork;
  onSelect: (network: CryptoNetwork) => void;
}

export function NetworkSelector({ selectedNetwork, onSelect }: NetworkSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">
          Выберите блокчейн-сеть USDT:
        </label>
        <span className="text-xs text-slate-400">4 доступные сети</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {NETWORKS.map((net) => {
          const isSelected = selectedNetwork === net.id;
          return (
            <button
              key={net.id}
              type="button"
              onClick={() => onSelect(net.id)}
              className={`relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all duration-200 ${
                isSelected
                  ? `border-emerald-500 bg-slate-900 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500`
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              {net.badge && (
                <span
                  className={`mb-2 inline-flex self-start rounded-full border px-2 py-0.5 text-[10px] font-semibold ${net.badgeColor}`}
                >
                  {net.badge}
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{net.chain}</span>
                  {isSelected && (
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{net.name}</p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px]">
                <span className="text-slate-400">Комиссия:</span>
                <span className="font-semibold text-slate-200">${net.feeUsdt.toFixed(2)}</span>
              </div>
              <div className="mt-0.5 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Скорость:</span>
                <span className="font-medium text-emerald-400">{net.speed}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
