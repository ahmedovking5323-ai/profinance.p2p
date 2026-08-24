import React from "react";
import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata = {
  title: "Панель управления оператора | USDTKG P2P Escrow",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <div className="min-h-[85vh]">
      <AdminDashboard />
    </div>
  );
}
