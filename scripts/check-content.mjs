/**
 * Проверка контента каталога. Ловит то, что не ловят типы и линтер:
 * ссылку в пустую выдачу, битую ссылку раздела, переписанное название
 * объявления и позицию без цены.
 *
 * Запуск: node scripts/check-content.mjs
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => JSON.parse(readFileSync(path.join(root, file), "utf8"));

const sections = read("content/catalog/sections.json");
const products = read("content/catalog/products.json");
const popularQueries = read("content/popular-queries.json");
const avitoItems = read("content/avito/items.json");
const titles = new Map(avitoItems.map((item) => [item.id, item.title.trim()]));

// Тот же нормализатор, что в lib/catalog.ts: «5,5» и «5.5» — один запрос.
const normalize = (value) => value.toLowerCase().replace(/,/g, ".");

function search(query) {
  const words = normalize(query.trim()).split(/\s+/);
  return products.filter((product) => {
    const haystack = normalize(
      [product.name, product.article, product.brand, ...product.params].join(" "),
    );
    return words.every((word) => haystack.includes(word));
  });
}

const groupSlugs = new Set(sections.flatMap((section) => section.groups.map((g) => g.slug)));
const sectionSlugs = new Set(sections.map((section) => section.slug));

for (const query of popularQueries) {
  assert.ok(search(query).length > 0, `Популярный запрос «${query}» ничего не находит`);
}

const slugs = new Set();
for (const product of products) {
  const id = `${product.brand} ${product.article}`;
  assert.ok(!slugs.has(product.slug), `Слаг повторяется: ${product.slug}`);
  slugs.add(product.slug);

  assert.ok(sectionSlugs.has(product.section), `${id}: неизвестный раздел ${product.section}`);
  assert.ok(groupSlugs.has(product.group), `${id}: неизвестная подгруппа ${product.group}`);
  assert.equal(product.article, product.article.toUpperCase(), `${id}: артикул не в верхнем регистре`);
  assert.ok(["шт", "м"].includes(product.unit), `${id}: неизвестная единица ${product.unit}`);
  assert.ok(product.price > 0, `${id}: позиция без цены — карточка окажется пустой`);
  assert.equal(typeof product.inStock, "boolean", `${id}: наличие должно быть да/нет`);
  assert.ok(
    !("leadDays" in product) && !("weightKg" in product),
    `${id}: срок поставки и масса заказчиком не даны — на витрине это читается как обещание`,
  );
  // Названия — авторские тексты объявлений. Переписывать их нельзя:
  // на витрине должно стоять ровно то, что продавец написал сам.
  assert.equal(
    product.name,
    titles.get(Number(product.article)),
    `${id}: название разошлось с исходным объявлением`,
  );
}

for (const section of sections) {
  assert.ok(section.groups.length > 0, `Раздел ${section.slug} без подгрупп`);
  for (const group of section.groups) {
    const count = products.filter((product) => product.group === group.slug).length;
    assert.ok(count > 0, `Подгруппа ${group.slug} пустая — ссылка ведёт в никуда`);
  }
}

// ── Копия: слова, по которым текст читается как рекламная заглушка.
// Проверяем строковые литералы в разметке, комментарии пропускаем.
const BANNED = [
  "надёжн", "качествен", "широкий ассортимент", "широкий выбор", "удобн",
  "профессиональн", "современн", "оптимальн", "эффективн", "индивидуальн подход",
  "гибк", "лучш", "уникальн", "огромн", "выгодн",
];

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const next = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(next);
    else if (entry.name.endsWith(".tsx")) files.push(next);
  }
};
walk("app");
walk("components");

for (const file of files) {
  const source = readFileSync(path.join(root, file), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .split("\n")
    .filter((line) => !line.trim().startsWith("//") && !line.trim().startsWith("*"))
    .join("\n")
    .toLowerCase();

  for (const word of BANNED) {
    assert.ok(!source.includes(word), `${file}: рекламное слово «${word}» в тексте`);
  }
}

console.log(
  `Проверено: ${products.length} позиций, ${groupSlugs.size} подгрупп, ${popularQueries.length} запросов, ${files.length} файлов разметки. Ошибок нет.`,
);
