/**
 * Выгрузка отзывов и рейтинга из Avito API в content/.
 *
 * Отзывы придумывать нельзя, а страница профиля отдаёт роботам капчу —
 * поэтому берём их официальным API. Ключи лежат в .env.local (в git не идут).
 *
 * Запуск: node scripts/fetch-avito-reviews.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://api.avito.ru";

/** Отзывы забираем целиком: под них есть отдельная страница. */
const MAX_PAGES = 40;

/**
 * Отзывы, где покупатель сам называет площадку, на витрину не идут.
 * Переписывать чужой текст нельзя — значит, такой отзыв просто не публикуем.
 */
const MENTIONS_MARKETPLACE = /авито|avito/i;

function env(name) {
  if (process.env[name]) return process.env[name];
  const file = path.join(root, ".env.local");
  if (!existsSync(file)) return undefined;
  const line = readFileSync(file, "utf8")
    .split("\n")
    .find((row) => row.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim();
}

async function token() {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env("AVITO_CLIENT_ID") ?? "",
    client_secret: env("AVITO_CLIENT_SECRET") ?? "",
  });
  const response = await fetch(`${API}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) throw new Error(`Токен не получен: HTTP ${response.status}`);
  const json = await response.json();
  return json.access_token;
}

async function get(url, accessToken) {
  const response = await fetch(`${API}${url}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

const accessToken = await token();

const info = await get("/ratings/v1/info", accessToken);
const summary = {
  rating: info.rating?.score ?? null,
  count: info.rating?.reviewsCount ?? null,
  scored: info.rating?.reviewsWithScoreCount ?? null,
  updatedAt: new Date().toISOString().slice(0, 10),
};

// Забираем страницами до конца: пустых (без текста) не сохраняем — читать
// в них нечего, а счётчик общего рейтинга и так берётся из сводки.
const reviews = [];
let skipped = 0;
for (let page = 0; page < MAX_PAGES; page += 1) {
  const chunk = await get(`/ratings/v1/reviews?offset=${page * 50}&limit=50`, accessToken);
  const batch = chunk.reviews ?? [];
  for (const review of batch) {
    const text = (review.text ?? "").trim();
    if (!text || review.stage !== "done") continue;
    if (MENTIONS_MARKETPLACE.test(text)) {
      skipped += 1;
      continue;
    }
    reviews.push({
      id: review.id,
      author: review.sender?.name?.trim() || "Покупатель",
      rating: review.score ?? null,
      date: new Date(review.createdAt * 1000).toISOString().slice(0, 10),
      text,
      item: review.item?.title?.trim() || null,
      answer: review.answer?.text?.trim() || null,
    });
  }
  if (batch.length < 50) break;
}

writeFileSync(
  path.join(root, "content/reviews-summary.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
);
writeFileSync(
  path.join(root, "content/reviews.json"),
  `${JSON.stringify(reviews, null, 2)}\n`,
);

console.log(
  `Рейтинг ${summary.rating} по ${summary.count} отзывам. Сохранено: ${reviews.length}.` +
    `${skipped > 0 ? ` Пропущено с упоминанием площадки: ${skipped}.` : ""}`,
);
