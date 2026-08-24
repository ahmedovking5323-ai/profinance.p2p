import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://usdt-kyrgyzstan.kg"),
  title: "Купить USDT в Кыргызстане (Бишкек) | Быстрый обмен KGS и USD через MBank и Visa",
  description:
    "Надежный P2P онлайн-обменник Tether USDT в Кыргызстане. Покупка в сетях TRC-20, BEP-20, ERC-20, TON за сомы (KGS) и доллары (USD). Оплата картами MBank, Optima Bank, Demir, Bakai. Зачисление за 2 минуты.",
  keywords: [
    "Купить USDT в Кыргызстане",
    "USDT Бишкек Visa Mastercard",
    "Tether KGS обмен",
    "MBank купить USDT",
    "Оптима банк крипта Кыргызстан",
    "Кыргызстан USDT сатып алуу",
    "USDT TRC20 Бишкек",
    "TON USDT Бишкек",
    "P2P обмен валют Бишкек",
    "купить криптовалюту в Бишкеке"
  ],
  authors: [{ name: "USDTKG P2P Exchange" }],
  openGraph: {
    title: "Купить USDT в Кыргызстане (KGS / USD) | USDTKG P2P Escrow",
    description:
      "Моментальная покупка Tether USDT за сомы и доллары через MBank, Optima, DemirBank. Сети TRC20, BEP20, TON, ERC20.",
    url: "https://usdt-kyrgyzstan.kg",
    siteName: "USDTKG Escrow",
    locale: "ru_KG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Купить USDT в Кыргызстане (Бишкек) | MBank, Optima, Visa",
    description: "Мгновенный обмен KGS и USD на USDT в сетях TRC20, BEP20, TON. Безопасный эскроу.",
  },
  alternates: {
    canonical: "https://usdt-kyrgyzstan.kg",
    languages: {
      "ru-KG": "https://usdt-kyrgyzstan.kg",
      "ky-KG": "https://usdt-kyrgyzstan.kg/ky",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: "USDTKG P2P Crypto Exchange",
  image: "https://usdt-kyrgyzstan.kg/logo.png",
  description: "B2C & P2P USDT purchasing platform in Kyrgyzstan supporting KGS and USD via local bank cards.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Бишкек",
    addressCountry: "KG",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "42.8746",
    longitude: "74.5698",
  },
  currenciesAccepted: "KGS, USD, USDT",
  paymentAccepted: "MBank, Optima Bank, DemirBank, Bakai Bank, Visa, Mastercard, Elkart",
  openingHours: "Mo-Su 00:00-24:00",
  priceRange: "$$",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950`}>
        <Navbar />
        <main className="relative min-h-[calc(100vh-140px)]">
          {children}
        </main>
        <footer className="border-t border-slate-800/80 bg-slate-950/80 py-10 text-xs text-slate-400">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white">USDT<span className="text-emerald-400">KG</span></span>
              <span>© {new Date().getFullYear()} Все права защищены. Кыргызстан, Бишкек.</span>
            </div>
            <div className="flex items-center space-x-6 text-slate-400">
              <a href="#calculator" className="hover:text-emerald-400">Калькулятор</a>
              <a href="#networks" className="hover:text-emerald-400">Сети</a>
              <a href="#faq" className="hover:text-emerald-400">FAQ</a>
              <a href="/admin" className="hover:text-emerald-400">Панель оператора</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
