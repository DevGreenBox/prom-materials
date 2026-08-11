"use client";

import { useSyncExternalStore } from "react";

import { getProduct } from "@/lib/catalog";
import { zones, type ZoneId } from "@/lib/delivery";

export type CartLine = { slug: string; qty: number };

export type Customer = {
  kind: "person" | "company";
  name: string;
  phone: string;
  email: string;
  company?: string;
  inn?: string;
  address?: string;
};

export type Order = {
  id: string;
  number: string;
  createdAt: string;
  lines: CartLine[];
  customer: Customer;
  zone: ZoneId;
  deliveryCost: number;
  status: "Принят" | "В сборке" | "Отгружен";
};

/** Сохранённый набор фильтров: снабженец ищет одно и то же из месяца в месяц. */
export type SavedFilter = { id: string; name: string; path: string };

/** Сохранённый список закупки: то, что снабженец собирает по объекту. */
export type PurchaseList = { id: string; name: string; createdAt: string; lines: CartLine[] };

type State = {
  /** Выбранное направление доставки: живёт между блоком на главной и корзиной. */
  zone: ZoneId;
  cart: CartLine[];
  favorites: string[];
  orders: Order[];
  viewed: string[];
  compare: string[];
  lists: PurchaseList[];
  filters: SavedFilter[];
};

export type Store = State & {
  /** false до гидратации: до неё сервер и клиент показывают пустое состояние. */
  ready: boolean;
  cartCount: number;
  cartSum: number;
};

const STORAGE_KEY = "prom-materials:v1";
const empty: State = {
  zone: "pickup",
  cart: [],
  favorites: [],
  orders: [],
  viewed: [],
  compare: [],
  lists: [],
  filters: [],
};

/**
 * Корзина, избранное и заказы живут в localStorage — сервера у проекта нет.
 * Модульный стор + useSyncExternalStore: на сервере и в первом клиентском
 * рендере снимок пустой, реальные данные подхватываются после гидратации,
 * поэтому разметка не разъезжается.
 */
let state: State = empty;
let snapshot: Store = build(empty, false);
const serverSnapshot: Store = snapshot;
const listeners = new Set<() => void>();
let hydrated = false;

function build(next: State, ready: boolean): Store {
  return {
    ...next,
    ready,
    cartCount: next.cart.reduce((sum, line) => sum + line.qty, 0),
    cartSum: next.cart.reduce(
      (sum, line) => sum + (getProduct(line.slug)?.price ?? 0) * line.qty,
      0,
    ),
  };
}

function read(): State {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      zone: zones.some((item) => item.id === parsed.zone)
        ? (parsed.zone as ZoneId)
        : "pickup",
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      viewed: Array.isArray(parsed.viewed) ? parsed.viewed : [],
      compare: Array.isArray(parsed.compare) ? parsed.compare : [],
      lists: Array.isArray(parsed.lists) ? parsed.lists : [],
      filters: Array.isArray(parsed.filters) ? parsed.filters : [],
    };
  } catch {
    // Повреждённое или чужое содержимое ключа не должно ронять сайт.
    return empty;
  }
}

function commit(next: State) {
  state = next;
  snapshot = build(next, true);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Приватный режим или переполненное хранилище: сайт продолжает работать,
    // просто корзина не переживёт перезагрузку.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  if (!hydrated) {
    hydrated = true;
    state = read();
    snapshot = build(state, true);
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore(): Store {
  return useSyncExternalStore(subscribe, () => snapshot, () => serverSnapshot);
}

export function addToCart(slug: string, qty = 1) {
  const line = state.cart.find((item) => item.slug === slug);
  commit({
    ...state,
    cart: line
      ? state.cart.map((item) => (item.slug === slug ? { ...item, qty: item.qty + qty } : item))
      : [...state.cart, { slug, qty }],
  });
}

export function setQty(slug: string, qty: number) {
  commit({
    ...state,
    cart:
      qty <= 0
        ? state.cart.filter((item) => item.slug !== slug)
        : state.cart.map((item) => (item.slug === slug ? { ...item, qty } : item)),
  });
}

export function removeFromCart(slug: string) {
  commit({ ...state, cart: state.cart.filter((item) => item.slug !== slug) });
}

/** Направление доставки выбирают в двух местах — на главной и в корзине. */
export function setZone(zone: ZoneId) {
  commit({ ...state, zone });
}

export function clearCart() {
  commit({ ...state, cart: [] });
}

/** История просмотра: последние позиции всплывают в подсказках поиска. */
export function rememberViewed(slug: string) {
  if (state.viewed[0] === slug) return;
  commit({ ...state, viewed: [slug, ...state.viewed.filter((item) => item !== slug)].slice(0, 8) });
}

/** Повтор заказа: состав уходит в корзину поверх того, что там уже есть. */
export function repeatOrder(id: string) {
  const order = state.orders.find((item) => item.id === id);
  if (!order) return;
  const cart = state.cart.map((line) => ({ ...line }));
  for (const line of order.lines) {
    const existing = cart.find((item) => item.slug === line.slug);
    if (existing) existing.qty += line.qty;
    else cart.push({ ...line });
  }
  commit({ ...state, cart });
}

/** Сравнение: больше четырёх колонок в таблицу параметров не влезает. */
export const COMPARE_LIMIT = 4;

export function toggleCompare(slug: string) {
  const inList = state.compare.includes(slug);
  if (!inList && state.compare.length >= COMPARE_LIMIT) return;
  commit({
    ...state,
    compare: inList ? state.compare.filter((item) => item !== slug) : [...state.compare, slug],
  });
}

export function clearCompare() {
  commit({ ...state, compare: [] });
}

/** Сохраняет текущую корзину как список закупки. */
export function saveList(name: string): string | null {
  if (state.cart.length === 0) return null;
  const id = `${new Date().getTime()}`;
  commit({
    ...state,
    lists: [
      { id, name: name.trim() || `Список от ${new Date().toLocaleDateString("ru-RU")}`, createdAt: new Date().toISOString(), lines: state.cart.map((line) => ({ ...line })) },
      ...state.lists,
    ],
  });
  return id;
}

export function deleteList(id: string) {
  commit({ ...state, lists: state.lists.filter((list) => list.id !== id) });
}

/** Кладёт сохранённый список в корзину поверх того, что там есть. */
export function listToCart(id: string) {
  const list = state.lists.find((item) => item.id === id);
  if (!list) return;
  const cart = state.cart.map((line) => ({ ...line }));
  for (const line of list.lines) {
    const existing = cart.find((item) => item.slug === line.slug);
    if (existing) existing.qty += line.qty;
    else cart.push({ ...line });
  }
  commit({ ...state, cart });
}

export function saveFilter(name: string, path: string): void {
  const id = `${new Date().getTime()}`;
  commit({ ...state, filters: [{ id, name, path }, ...state.filters].slice(0, 12) });
}

export function deleteFilter(id: string) {
  commit({ ...state, filters: state.filters.filter((item) => item.id !== id) });
}

export function toggleFavorite(slug: string) {
  commit({
    ...state,
    favorites: state.favorites.includes(slug)
      ? state.favorites.filter((item) => item !== slug)
      : [...state.favorites, slug],
  });
}

/** Создаёт заказ из текущей корзины, очищает её и возвращает id заказа. */
export function placeOrder(input: {
  customer: Customer;
  zone: ZoneId;
  deliveryCost: number;
}): string {
  const now = new Date();
  const id = `${now.getTime()}`;
  commit({
    ...state,
    cart: [],
    orders: [
      {
        id,
        number: `${now.getFullYear()}-${id.slice(-5)}`,
        createdAt: now.toISOString(),
        lines: state.cart,
        ...input,
        status: "Принят",
      },
      ...state.orders,
    ],
  });
  return id;
}
