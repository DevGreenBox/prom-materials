import sectionsData from "@/content/catalog/sections.json";
import productsData from "@/content/catalog/products.json";

export type Product = {
  slug: string;
  name: string;
  article: string;
  /** Пустая строка, если в названии объявления производитель не указан. */
  brand: string;
  section: string;
  group: string;
  unit: string;
  price: number;
  inStock: boolean;
  specs: Record<string, string>;
  params: string[];
  /** Фотографии позиции: до пяти, пустой массив — снимков нет. */
  images: string[];
  address: string;
};

export type Group = { slug: string; name: string };
export type Section = { slug: string; name: string; summary: string; groups: Group[] };

export const sections = sectionsData as Section[];
// JSON выводится как объединение литеральных типов (у позиций разный набор
// характеристик), поэтому приведение идёт через unknown.
export const products = productsData as unknown as Product[];

/**
 * Фасеты фильтра. `param` — короткий латинский ключ в URL (он же попадает
 * в выдачу поисковиков), `spec` — характеристика, из которой берутся значения.
 * Порядок задан в дизайн-системе: сначала наличие и производитель, потом
 * электрические параметры, потом монтажные.
 */
export const facetDefs = [
  { param: "brand", label: "Производитель", spec: null },
  { param: "dn", label: "Условный проход", spec: "Условный проход" },
  { param: "pressure", label: "Давление", spec: "Давление" },
  { param: "screen", label: "Диагональ", spec: "Диагональ" },
  { param: "channels", label: "Каналов", spec: "Каналов" },
  { param: "principle", label: "Принцип", spec: "Принцип" },
  { param: "bus", label: "Интерфейс", spec: "Интерфейс" },
  { param: "sensor", label: "Тип датчика", spec: "Тип датчика" },
  { param: "material", label: "Материал", spec: "Материал" },
  { param: "ip", label: "Степень защиты", spec: "Степень защиты" },
  { param: "exec", label: "Исполнение", spec: "Исполнение" },
  { param: "condition", label: "Состояние", spec: "Состояние" },
  { param: "country", label: "Производство", spec: "Производство" },
] as const;

/**
 * Числовые фасеты — диапазоном «от–до», а не списком галочек. Номиналов
 * слишком много, чтобы выбирать их поштучно: 52 разных тока, 38 мощностей,
 * и подбирают их не точным совпадением, а вилкой — «автомат до 100 А».
 *
 * Границы уезжают в адрес одним значением «мин-макс», как у цены.
 */
export const rangeFacets = [
  { param: "power", label: "Мощность, кВт", spec: "Мощность" },
  { param: "voltage", label: "Напряжение, В", spec: "Напряжение" },
  { param: "current", label: "Ток, А", spec: "Номинальный ток" },
] as const;

export type RangeParam = (typeof rangeFacets)[number]["param"];

/** Значение диапазона из адреса: «1.5-11» → [1.5, 11]. */
export function parseRange(value: string | undefined): [number, number] {
  const [min, max] = (value ?? "").split("-").map(Number);
  return [min, max];
}

export type FacetParam = (typeof facetDefs)[number]["param"];
export type Facet = { param: string; label: string; values: { value: string; count: number }[] };
/** Выбранные значения фасетов: ключ фасета → выбранные значения. */
export type Selection = Record<string, string[]>;

export const sortOptions = [
  { value: "popular", label: "По популярности" },
  { value: "price-asc", label: "Сначала дешевле" },
  { value: "price-desc", label: "Сначала дороже" },
  { value: "power", label: "По мощности" },
  { value: "current", label: "По току" },
  { value: "name", label: "По названию" },
] as const;

export type SortValue = (typeof sortOptions)[number]["value"];

export function getSection(slug: string): Section | undefined {
  return sections.find((section) => section.slug === slug);
}

export function getGroup(section: Section, slug: string): Group | undefined {
  return section.groups.find((group) => group.slug === slug);
}

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function productsOf({ section, group }: { section?: string; group?: string } = {}): Product[] {
  return products.filter(
    (product) =>
      (section === undefined || product.section === section) &&
      (group === undefined || product.group === group),
  );
}

export function countIn({ section, group }: { section?: string; group?: string }): number {
  return productsOf({ section, group }).length;
}

/** Значение фасета у товара: либо поле товара, либо характеристика. */
function facetValue(product: Product, param: string, spec: string | null): string | undefined {
  if (spec) return product.specs[spec];
  if (param === "brand") return product.brand || undefined;
  return undefined;
}

/**
 * Числовое значение для сортировки: «16 А» → 16, «1P+N» → 1, «IP54» → 54.
 * Значения без числа уезжают в конец и сортируются по алфавиту.
 */
function numeric(value: string): number {
  if (!value) return Number.POSITIVE_INFINITY;
  const match = value.replace(",", ".").match(/[\d.]+/);
  return match ? Number.parseFloat(match[0]) : Number.POSITIVE_INFINITY;
}

function compareValues(a: string, b: string): number {
  const diff = numeric(a) - numeric(b);
  if (Number.isNaN(diff) || diff === 0) return a.localeCompare(b, "ru");
  return Number.isFinite(diff) ? diff : a.localeCompare(b, "ru");
}

/**
 * Фасеты по выборке. Счётчик у значения показывает, сколько позиций
 * останется, если его выбрать — то есть считается по уже применённым
 * фильтрам, кроме самого этого фасета. Значения с нулём не исчезают,
 * а гаснут: список не должен прыгать под курсором.
 */
export function buildFacets(scope: Product[], selection: Selection = {}): Facet[] {
  const facets: Facet[] = [];

  for (const def of facetDefs) {
    const values = new Set<string>();
    for (const product of scope) {
      const value = facetValue(product, def.param, def.spec);
      if (value) values.add(value);
    }
    if (values.size < 2) continue;

    const others: Selection = { ...selection };
    delete others[def.param];
    const narrowed = filterProducts(scope, others);

    facets.push({
      param: def.param,
      label: def.label,
      values: [...values]
        .map((value) => ({
          value,
          count: narrowed.filter(
            (product) => facetValue(product, def.param, def.spec) === value,
          ).length,
        }))
        .sort((a, b) => compareValues(a.value, b.value)),
    });
  }

  return facets;
}

export function filterProducts(scope: Product[], selection: Selection): Product[] {
  const active = facetDefs.filter((def) => selection[def.param]?.length);
  // Границы цены и номиналов приходят одним значением вида «1000-50000»:
  // диапазон живёт в том же объекте выбора, что и фасеты, чтобы адрес
  // оставался единственным местом состояния.
  const [minPrice, maxPrice] = parseRange(selection.price?.[0]);
  const ranges = rangeFacets
    .filter((def) => selection[def.param]?.length)
    .map((def) => ({ def, bounds: parseRange(selection[def.param][0]) }));

  return scope.filter((product) => {
    if (Number.isFinite(minPrice) && product.price < minPrice) return false;
    if (Number.isFinite(maxPrice) && maxPrice > 0 && product.price > maxPrice) return false;

    for (const { def, bounds } of ranges) {
      // Позиция без номинала под вилку не подходит: обещать «до 100 А»
      // там, где ток вообще не указан, нельзя.
      const raw = product.specs[def.spec];
      if (!raw) return false;
      const value = numeric(raw);
      if (Number.isFinite(bounds[0]) && value < bounds[0]) return false;
      if (Number.isFinite(bounds[1]) && bounds[1] > 0 && value > bounds[1]) return false;
    }

    return active.every((def) => {
      const value = facetValue(product, def.param, def.spec);
      return value !== undefined && selection[def.param].includes(value);
    });
  });
}

/** Наименьший и наибольший номинал в выборке — подсказка для полей «от–до». */
export function rangeBounds(scope: Product[], spec: string): [number, number] | null {
  const values = scope
    .map((product) => product.specs[spec])
    .filter(Boolean)
    .map(numeric)
    .filter(Number.isFinite);
  if (values.length < 2) return null;
  return [Math.min(...values), Math.max(...values)];
}

export function sortProducts(list: Product[], sort: SortValue): Product[] {
  const sorted = [...list];
  if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  // Подбор номинала идёт по возрастанию: позиции без параметра — в конец.
  if (sort === "current" || sort === "power") {
    const spec = sort === "current" ? "Номинальный ток" : "Мощность";
    sorted.sort((a, b) => numeric(a.specs[spec] ?? "") - numeric(b.specs[spec] ?? ""));
  }
  return sorted;
}

/**
 * Поиск по названию, артикулу, производителю и номиналам.
 * Дробные пишут и через запятую, и через точку («5,5 кВт» и «5.5 кВт»),
 * поэтому обе стороны сравнения приводятся к одному виду.
 */
const normalize = (value: string) => value.toLowerCase().replace(/,/g, ".");

export function searchProducts(query: string, scope: Product[] = products): Product[] {
  const needle = normalize(query.trim());
  if (needle.length < 2) return [];
  const words = needle.split(/\s+/);
  return scope.filter((product) => {
    const haystack = normalize(
      [product.name, product.article, product.brand, ...product.params].join(" "),
    );
    return words.every((word) => haystack.includes(word));
  });
}

export function sectionOf(product: Product): Section | undefined {
  return getSection(product.section);
}

export function groupOf(product: Product): Group | undefined {
  return sectionOf(product)?.groups.find((group) => group.slug === product.group);
}
