/**
 * Фотографии позиций из сохранённых страниц профиля продавца.
 *
 * API фотографии не отдаёт, а страницы закрыты от роботов — защиту обходить
 * не будем. Поэтому источник здесь ручной: страница сохраняется из браузера
 * в `inbox/*.html`, скрипт достаёт из неё номера объявлений и все снимки
 * галереи и складывает файлы в `public/images/products/<номер>-<n>.jpg`.
 *
 * Чем больше страниц положить в inbox, тем больше позиций получат фото:
 * скрипт объединяет всё, что найдёт, и не трогает уже скачанное.
 *
 * Запуск: pnpm images
 */
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inbox = path.join(root, "inbox");
const outDir = path.join(root, "public/images/products");
const mapFile = path.join(root, "content/avito/images.json");

/** Сколько снимков берём с позиции: дальше в галерее уже дубли ракурсов. */
const PER_ITEM = 5;

if (!existsSync(inbox)) {
  console.log("Папки inbox/ нет — класть сохранённые страницы некуда.");
  process.exit(0);
}

/**
 * Все снимки карточки. Один `srcset` — это одна фотография в шести размерах,
 * поэтому фотографии считаем по `srcset`, а внутри берём самый крупный
 * вариант: мелкие идут в превью и на карточке позиции рассыпаются.
 */
function galleryOf(chunk) {
  const photos = [];
  for (const match of chunk.matchAll(/srcset="([^"]+)"/g)) {
    // В части ссылок есть подписанный параметр обрезки (`?cqp=…`) —
    // без него сервер отдаёт 403, поэтому берём адрес целиком до пробела.
    const variants = [
      ...match[1].matchAll(/(https:\/\/\d+\.img\.avito\.st\/image\/1\/[^\s,]+)\s+(\d+)w/g),
    ];
    if (variants.length === 0) continue;
    const largest = variants.sort((a, b) => Number(b[2]) - Number(a[2]))[0][1];
    if (!photos.includes(largest)) photos.push(largest);
  }
  return photos.slice(0, PER_ITEM);
}

const found = new Map();
for (const file of readdirSync(inbox).filter((name) => name.endsWith(".html"))) {
  const html = readFileSync(path.join(inbox, file), "utf8");
  // Границей карточки служит следующее объявление: галерея лежит внутри неё,
  // и по фиксированному числу символов часть снимков терялась.
  const marks = [...html.matchAll(/data-item-id="(\d+)"/g)];
  for (const [index, match] of marks.entries()) {
    const id = match[1];
    if (found.has(id)) continue;
    const end = marks[index + 1]?.index ?? match.index + 20000;
    const photos = galleryOf(html.slice(match.index, end));
    if (photos.length > 0) found.set(id, photos);
  }
}

if (found.size === 0) {
  console.log("В inbox/*.html объявлений с фотографиями не нашлось.");
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });
mkdirSync(path.dirname(mapFile), { recursive: true });

const images = existsSync(mapFile) ? JSON.parse(readFileSync(mapFile, "utf8")) : {};
let downloaded = 0;
let failed = 0;
let duplicates = 0;

const digest = (file) => createHash("md5").update(readFileSync(file)).digest("hex");

/**
 * Качаем по несколько снимков сразу: последовательно несколько тысяч файлов
 * идут очень долго. Больше восьми потоков не берём — это чужой сервер.
 */
const queue = [...found];
async function worker() {
  while (queue.length > 0) {
    const [id, urls] = queue.pop();
    const saved = [];
    const seen = new Set();

    for (const [index, url] of urls.entries()) {
      const name = `${id}-${index + 1}.jpg`;
      const file = path.join(outDir, name);
      if (!existsSync(file)) {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          writeFileSync(file, Buffer.from(await response.arrayBuffer()));
          downloaded += 1;
        } catch (error) {
          failed += 1;
          console.warn(`${id} (${index + 1}): ${error.message}`);
          continue;
        }
      }

      // Один и тот же снимок лежит в объявлении под разными адресами:
      // ссылки не совпадают, а файлы совпадают побайтно. Отличить их можно
      // только по содержимому — иначе в карточке появляется точка,
      // которая листает на ту же самую фотографию.
      const hash = digest(file);
      if (seen.has(hash)) {
        rmSync(file, { force: true });
        duplicates += 1;
        continue;
      }
      seen.add(hash);
      saved.push(`/images/products/${name}`);
    }

    if (saved.length > 0) images[id] = saved;
  }
}

await Promise.all(Array.from({ length: 8 }, worker));

writeFileSync(mapFile, `${JSON.stringify(images, null, 2)}\n`);

const total = Object.values(images).reduce((sum, list) => sum + list.length, 0);
console.log(
  `Объявлений с фото: ${Object.keys(images).length}. Снимков всего: ${total}.` +
    ` Скачано новых: ${downloaded}.` +
    `${duplicates > 0 ? ` Отсеяно дублей: ${duplicates}.` : ""}` +
    `${failed > 0 ? ` Не удалось: ${failed}.` : ""}`,
);
