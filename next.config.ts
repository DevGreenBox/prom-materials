import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Рядом лежит внешний pnpm-workspace, поэтому корень указываем явно —
  // иначе Turbopack выбирает родительскую папку.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
