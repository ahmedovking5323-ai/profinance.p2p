import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/order/*"],
      },
    ],
    sitemap: "https://usdt-kyrgyzstan.kg/sitemap.xml",
  };
}
