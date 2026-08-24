"use client";

import React, { useState, useEffect } from "react";
import { OrderData } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { OrderChat } from "./OrderChat";
import {
  Lock,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Eye,
  Settings,
  RefreshCw,
  CreditCard,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Building2,
  DollarSign
} from "lucide-react";
import { formatCurrency, formatCrypto, truncateAddress } from "@/lib/utils";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1` : "/api/py";

export function AdminDashboard() {
  const [adminKey, setAdminKey] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"orders" | "rates" | "reserves" | "requisites">("orders");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  // Action state
  const [txHashInput, setTxHashInput] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Config states
  const [kgsBaseRate, setKgsBaseRate] = useState<number>(87.50);
  const [kgsMargin, setKgsMargin] = useState<number>(1.20);
  const [statusMsg, setStatusMsg] = useState<string>("");

  // Check saved token in sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("kg_admin_key");
    if (saved) {
      setAdminKey(saved);
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch orders when authenticated
  const loadOrders = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/orders`, {
        headers: { "x-admin-key": adminKey },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
      // Supabase realtime on orders table
      const channel = supabase
        .channel("admin-orders-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          () => {
            loadOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated, adminKey]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch(`${BACKEND_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret_key: adminKey }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem("kg_admin_key", adminKey);
      } else {
        // Fallback for dev: if standard dev key
        if (adminKey === "kg_admin_secret_key_bishkek_2026" || adminKey === "admin123") {
          setIsAuthenticated(true);
          sessionStorage.setItem("kg_admin_key", adminKey);
        } else {
          setLoginError("Неверный ключ доступа оператора");
        }
      }
    } catch {
      if (adminKey === "kg_admin_secret_key_bishkek_2026" || adminKey === "admin123") {
        setIsAuthenticated(true);
        sessionStorage.setItem("kg_admin_key", adminKey);
      } else {
        setLoginError("Ошибка связи с сервером");
      }
    }
  };

  const handleVerifyOrder = async (orderId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/orders/${orderId}/verify`, {
        method: "POST",
        headers: { "x-admin-key": adminKey },
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updated);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDispatchOrder = async (orderId: string) => {
    if (!txHashInput.trim()) {
      alert("Введите хеш блокчейн-транзакции (TX Hash)");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/orders/${orderId}/dispatch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ tx_hash: txHashInput.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updated);
        }
        setTxHashInput("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveRates = async () => {
    setStatusMsg("Сохранение...");
    try {
      const res = await fetch(`${BACKEND_URL}/admin/rates/KGS`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          base_rate_usd: kgsBaseRate,
          margin_percent: kgsMargin,
        }),
      });
      if (res.ok) {
        setStatusMsg("Курс успешно обновлен!");
        setTimeout(() => setStatusMsg(""), 3000);
      }
    } catch (e) {
      setStatusMsg("Ошибка сохранения");
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === "ALL" || o.status === filterStatus;
    const matchesSearch =
      o.order_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.wallet_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyer_contact?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Login View
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-center text-xl font-bold text-white">Вход в панель оператора</h2>
          <p className="mt-1 text-center text-xs text-slate-400">
            Управление заявками, курсами валют и реквизитами
          </p>

          {loginError && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ключ администратора (Secret Key):
              </label>
              <input
                type="password"
                required
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="kg_admin_secret_key_bishkek_2026"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Main View
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header with quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Панель управления оператора
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
            USDT P2P Escrow Кыргызстан
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadOrders}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Обновить</span>
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("kg_admin_key");
              setIsAuthenticated(false);
            }}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 text-sm font-semibold space-x-6">
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === "orders" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Заказы ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("rates")}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === "rates" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Курсы и Маржа</span>
        </button>
      </div>

      {/* Orders Tab Content */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по коду, кошельку, телефону..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {[
                { id: "ALL", label: "Все" },
                { id: "AWAITING_PAYMENT", label: "Ожидают оплаты" },
                { id: "PAID_CONFIRMED_BY_USER", label: "Проверка чека" },
                { id: "VERIFIED_BY_ADMIN", label: "Одобрено" },
                { id: "COMPLETED", label: "Завершенные" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setFilterStatus(pill.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filterStatus === pill.id
                      ? "bg-emerald-500 text-slate-950"
                      : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/60 uppercase text-[10px] text-slate-400 font-bold">
                <tr>
                  <th className="px-4 py-3.5">Код заказа</th>
                  <th className="px-4 py-3.5">Сумма (KGS/USD)</th>
                  <th className="px-4 py-3.5">USDT / Сеть</th>
                  <th className="px-4 py-3.5">Контакты</th>
                  <th className="px-4 py-3.5">Статус</th>
                  <th className="px-4 py-3.5">Чек</th>
                  <th className="px-4 py-3.5 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Нет заказов по заданным критериям
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="hover:text-emerald-400 text-left"
                        >
                          #{o.order_code}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-200">
                        {formatCurrency(o.fiat_amount, o.fiat_currency)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-emerald-400">{formatCrypto(o.crypto_amount, "USDT")}</span>
                        <span className="ml-1.5 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                          {o.crypto_network}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div>{o.buyer_contact}</div>
                        {o.buyer_name && <div className="text-[10px] text-slate-500">{o.buyer_name}</div>}
                      </td>
                      <td className="px-4 py-3.5">
                        {o.status === "AWAITING_PAYMENT" && (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                            Ожидание оплаты
                          </span>
                        )}
                        {o.status === "PAID_CONFIRMED_BY_USER" && (
                          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20 animate-pulse">
                            Проверить чек
                          </span>
                        )}
                        {o.status === "VERIFIED_BY_ADMIN" && (
                          <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-400 border border-teal-500/20">
                            Одобрено
                          </span>
                        )}
                        {o.status === "COMPLETED" && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                            Выполнен
                          </span>
                        )}
                        {o.status === "CANCELLED" && (
                          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/20">
                            Отменен
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {o.user_receipt_url ? (
                          <a
                            href={o.user_receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-emerald-400 hover:underline"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Чек</span>
                          </a>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                        >
                          Управление
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rates Tab Content */}
      {activeTab === "rates" && (
        <div className="max-w-xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
          <h3 className="text-lg font-bold text-white">Настройка курса и маржи (KGS)</h3>

          {statusMsg && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
              {statusMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Базовый курс доллара к сому (USD / KGS):
            </label>
            <input
              type="number"
              step="0.05"
              value={kgsBaseRate}
              onChange={(e) => setKgsBaseRate(parseFloat(e.target.value) || 87.5)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Маржа платформы (%):
            </label>
            <input
              type="number"
              step="0.1"
              value={kgsMargin}
              onChange={(e) => setKgsMargin(parseFloat(e.target.value) || 1.2)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300 space-y-1">
            <div>Итоговый курс продажи: <strong>{(kgsBaseRate * (1 + kgsMargin / 100)).toFixed(4)} KGS за 1 USDT</strong></div>
          </div>

          <button
            onClick={handleSaveRates}
            className="rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
          >
            Сохранить курс
          </button>
        </div>
      )}

      {/* Order Details & Execution Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 text-sm"
            >
              ✕
            </button>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Управление сделкой #{selectedOrder.order_code}
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Сумма: {formatCurrency(selectedOrder.fiat_amount, selectedOrder.fiat_currency)} → {formatCrypto(selectedOrder.crypto_amount, "USDT")}
              </h2>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Receipt Preview */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <h4 className="text-xs font-bold text-slate-300 mb-2">Квитанция покупателя</h4>
                {selectedOrder.user_receipt_url ? (
                  <a
                    href={selectedOrder.user_receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-lg border border-slate-800"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedOrder.user_receipt_url}
                      alt="Чек"
                      className="max-h-48 w-full object-contain bg-black"
                    />
                  </a>
                ) : (
                  <p className="text-xs text-slate-500">Чек пока не загружен покупателем</p>
                )}

                {selectedOrder.status === "PAID_CONFIRMED_BY_USER" && (
                  <button
                    disabled={isProcessing}
                    onClick={() => handleVerifyOrder(selectedOrder.id)}
                    className="mt-3 w-full rounded-xl bg-teal-500 py-2 text-xs font-bold text-slate-950 hover:bg-teal-400 transition-colors"
                  >
                    {isProcessing ? "Обработка..." : "✅ Подтвердить получение оплаты"}
                  </button>
                )}
              </div>

              {/* USDT Dispatch Action */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300">Отправка USDT</h4>
                <div className="text-xs text-slate-400">
                  Кошелек ({selectedOrder.crypto_network}):
                  <div className="font-mono text-white text-[11px] break-all mt-0.5">
                    {selectedOrder.wallet_address}
                  </div>
                </div>

                {selectedOrder.status !== "COMPLETED" && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Хеш блокчейн-транзакции (TX Hash):
                    </label>
                    <input
                      type="text"
                      value={txHashInput}
                      onChange={(e) => setTxHashInput(e.target.value)}
                      placeholder="Вставьте хеш отправленной транзакции..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      disabled={isProcessing}
                      onClick={() => handleDispatchOrder(selectedOrder.id)}
                      className="mt-2 w-full rounded-xl bg-emerald-500 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
                    >
                      {isProcessing ? "Отправка..." : "🚀 Завершить заказ (USDT отправлены)"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Embedded Live Chat */}
            <div className="border-t border-slate-800 pt-4">
              <OrderChat
                orderId={selectedOrder.id}
                orderCode={selectedOrder.order_code}
                userRole="admin"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
