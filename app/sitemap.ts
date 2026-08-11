import type { MetadataRoute } from "next";

import { products, sections } from "@/lib/catalog";
import { site } from "@/lib/site";

const staticPaths = [
  "",
  "/catalog",
  "/corporate",
  "/reviews",
  "/delivery",
  "/payment",
  "/about",
  "/contacts",
  "/offer",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${site.url}${path}`;

  return [
    ...staticPaths.map((path) => ({ url: url(path), changeFrequency: "monthly" as const })),
    ...sections.flatMap((section) => [
      { url: url(`/catalog/${section.slug}`), changeFrequency: "weekly" as const },
      ...section.groups.map((group) => ({
        url: url(`/catalog/${section.slug}/${group.slug}`),
        changeFrequency: "weekly" as const,
      })),
    ]),
    ...products.map((product) => ({
      url: url(`/product/${product.slug}`),
      changeFrequency: "weekly" as const,
    })),
  ];
}
