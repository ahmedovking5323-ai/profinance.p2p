"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { OrderData, fetchOrderDetails } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { OrderTracker } from "@/components/OrderTracker";
import { OrderChat } from "@/components/OrderChat";
import { Loader2, AlertCircle, ArrowLeft, ShieldAlert, Headphones } from "lucide-react";
import Link from "next/link";

export default function OrderPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // 1. Initial Fetch
  const loadOrder = async () => {
    try {
      if (!orderId) return;
      const data = await fetchOrderDetails(orderId);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || "Заказ не найден");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  // 2. Realtime listener for order status changes
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          setOrder((prev) => (prev ? { ...prev, ...updated } : null));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <p className="text-xs text-slate-400 font-medium">Загрузка данных заказа #{orderId}...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-white">Заказ не найден</h2>
        <p className="mt-1 text-xs text-slate-400">
          Возможно, истек срок действия или указан неверный номер заказа.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center space-x-1.5 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Вернуться на главную</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Главная</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300">Заказ #{order.order_code}</span>
        </Link>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Headphones className="h-3.5 w-3.5 text-emerald-400" />
          <span>Служба поддержки: @usdt_kg_support</span>
        </div>
      </div>

      {/* Grid: Left Order Tracker, Right Live Deal Chat */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <OrderTracker
            order={order}
            onOrderUpdated={(updated) => setOrder(updated)}
          />
        </div>

        <div className="lg:col-span-5">
          <OrderChat
            orderId={order.id}
            orderCode={order.order_code}
            userRole="buyer"
          />
        </div>
      </div>
    </div>
  );
}
