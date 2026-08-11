/**
 * Выгрузка объявлений продавца из Avito API в content/avito/items.json.
 *
 * Это сырой кэш: названия, цены, категории и ссылки как их отдаёт Avito.
 * Каталог собирается из него отдельным шагом (scripts/build-catalog.mjs),
 * чтобы разбор названий можно было чинить без повторных запросов к API.
 *
 * Запуск: pnpm items
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://api.avito.ru";

function env(name) {
  if (process.env[name]) return process.env[name];
  const file = path.join(root, ".env.local");
  if (!existsSync(file)) return undefined;
  const line = readFileSync(file, "utf8")
    .split("\n")
    .find((row) => row.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim();
}

const response = await fetch(`${API}/token/`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env("AVITO_CLIENT_ID") ?? "",
    client_secret: env("AVITO_CLIENT_SECRET") ?? "",
  }),
});
if (!response.ok) throw new Error(`Токен не получен: HTTP ${response.status}`);
const { access_token: token } = await response.json();

const items = [];
for (let page = 1; page <= 40; page += 1) {
  const url = `${API}/core/v1/items?per_page=100&page=${page}&status=active`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Страница ${page}: HTTP ${res.status}`);
  const { resources = [] } = await res.json();
  items.push(...resources);
  if (resources.length < 100) break;
}

mkdirSync(path.join(root, "content/avito"), { recursive: true });
writeFileSync(
  path.join(root, "content/avito/items.json"),
  `${JSON.stringify(items, null, 2)}\n`,
);

console.log(`Объявлений выгружено: ${items.length}.`);
