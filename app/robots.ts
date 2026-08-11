import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

/**
 * Пока сайт демонстрационный — закрыт от индексации целиком.
 * Перед запуском: снять disallow, убрать `robots: { index: false }`
 * из app/layout.tsx и выключить DEMO_CATALOG.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
