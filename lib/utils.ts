import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string): string {
  if (currency === "KGS") {
    return new Intl.NumberFormat("ru-KG", {
      style: "currency",
      currency: "KGS",
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCrypto(amount: number, symbol: string = "USDT"): string {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })} ${symbol}`;
}

export function formatCardNumber(card: string): string {
  if (!card) return "";
  const cleaned = card.replace(/\s+/g, "");
  return cleaned.replace(/(.{4})/g, "$1 ").trim();
}

export function truncateAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
}
