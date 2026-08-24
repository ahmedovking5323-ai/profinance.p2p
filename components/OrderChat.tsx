"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase, RealtimeChatMessage, uploadReceiptImage } from "@/lib/supabase";
import { fetchOrderMessages, sendChatMessage } from "@/lib/api";
import { Send, Image as ImageIcon, Loader2, Bot, User, ShieldAlert, Sparkles } from "lucide-react";

interface OrderChatProps {
  orderId: string;
  orderCode: string;
  userRole?: "buyer" | "admin";
}

export function OrderChat({ orderId, orderCode, userRole = "buyer" }: OrderChatProps) {
  const [messages, setMessages] = useState<RealtimeChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Initial Load of chat messages
  useEffect(() => {
    let isCancelled = false;
    async function load() {
      try {
        const msgs = await fetchOrderMessages(orderId);
        if (!isCancelled && msgs) {
          setMessages(msgs);
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();

    return () => {
      isCancelled = true;
    };
  }, [orderId]);

  // 2. Realtime channel subscription via Supabase
  useEffect(() => {
    const channel = supabase
      .channel(`order-chat-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order_messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newMsg = payload.new as RealtimeChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setIsSending(true);

    try {
      const senderName = userRole === "admin" ? "Оператор Обмена" : "Покупатель";
      const created = await sendChatMessage(orderId, {
        sender_type: userRole,
        sender_name: senderName,
        message: textToSend,
      });

      // Optimistic addition
      setMessages((prev) => {
        if (prev.some((m) => m.id === created.id)) return prev;
        return [...prev, created];
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const { url } = await uploadReceiptImage(file, orderId);
      if (url) {
        const senderName = userRole === "admin" ? "Оператор Обмена" : "Покупатель";
        const created = await sendChatMessage(orderId, {
          sender_type: userRole,
          sender_name: senderName,
          message: "Прикреплен файл/скриншот квитанции",
          attachment_url: url,
        });

        setMessages((prev) => [...prev, created]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex h-[520px] flex-col rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur-xl">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
            <span className="absolute -inset-0.5 animate-ping rounded-full bg-emerald-400 opacity-60"></span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Чат сделки #{orderCode}</h3>
            <p className="text-[10px] text-slate-400">Оператор и эскроу-бот на связи</p>
          </div>
        </div>

        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
          Supabase Realtime
        </span>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
            <Bot className="h-8 w-8 mb-2 text-slate-600" />
            <p>Чат заказа открыт. Сообщения и статус сделки отображаются в реальном времени.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isSystem = msg.sender_type === "system";
          const isMe =
            (userRole === "buyer" && msg.sender_type === "buyer") ||
            (userRole === "admin" && msg.sender_type === "admin");

          if (isSystem) {
            return (
              <div
                key={msg.id}
                className="mx-auto my-2 max-w-[90%] rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-center text-[11px] text-amber-300"
              >
                <div className="flex items-center justify-center space-x-1 font-bold">
                  <Bot className="h-3.5 w-3.5" />
                  <span>{msg.sender_name}</span>
                </div>
                <p className="mt-0.5 text-slate-300">{msg.message}</p>
                <span className="mt-1 block text-[9px] text-slate-500">
                  {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <span className="mb-1 text-[10px] text-slate-400 font-medium px-1">
                {msg.sender_name}
              </span>

              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                  isMe
                    ? "bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-950"
                    : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.message}</p>

                {msg.attachment_url && (
                  <div className="mt-2">
                    <a
                      href={msg.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden rounded-lg border border-white/20 bg-black/40 hover:opacity-90 transition-opacity"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.attachment_url}
                        alt="Чек"
                        className="max-h-48 w-auto object-cover"
                      />
                    </a>
                  </div>
                )}

                <span className="mt-1 block text-right text-[9px] opacity-70">
                  {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="border-t border-slate-800/80 p-3">
        <div className="flex items-center space-x-2">
          {/* File attach button */}
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Прикрепить скриншот чека"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-emerald-400" /> : <ImageIcon className="h-4 w-4" />}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Напишите сообщение оператору..."
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="rounded-xl bg-emerald-500 p-2.5 text-slate-950 hover:bg-emerald-400 disabled:opacity-40 transition-colors"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
