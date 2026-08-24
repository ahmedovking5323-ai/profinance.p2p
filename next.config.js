/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "supabase.co", "localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Proxy /api requests to FastAPI backend when running in development
  async rewrites() {
    return [
      {
        source: "/api/py/:path*",
        destination:
          process.env.NODE_ENV === "production"
            ? (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000") + "/api/v1/:path*"
            : "http://localhost:8000/api/v1/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
