/**
 * СДЭК: подсказка городов, пункты выдачи и расчёт тарифа.
 *
 * Ключи берутся из окружения (`CDEK_CLIENT_ID`, `CDEK_CLIENT_SECRET`) —
 * это учётные данные интеграции из личного кабинета СДЭК. Пока их нет,
 * `cdekReady` равно false: витрина не показывает выдуманных ставок,
 * а предлагает самовывоз и расчёт через менеджера.
 *
 * Модуль серверный: ключи не должны попадать в браузер, поэтому обращения
 * идут через `app/api/cdek/route.ts`.
 */
const API = process.env.CDEK_API ?? "https://api.cdek.ru/v2";

/** Откуда едет заказ — склад продавца. TODO(client): подтвердить город. */
export const CDEK_FROM_CITY = 44; // Москва

/**
 * Тарифы СДЭК: «Посылка склад-склад» и «Посылка склад-дверь».
 * TODO(client): если в договоре другие тарифы — поменять коды здесь.
 */
export const CDEK_TARIFF = { pvz: 136, courier: 137 } as const;

/**
 * Габариты и вес места. Массы позиций в объявлениях нет, поэтому расчёт
 * идёт по одному усреднённому месту на позицию, и на витрине это сказано
 * прямым текстом. TODO(client): заменить на настоящие веса из прайса.
 */
export const CDEK_PACKAGE = { weight: 3000, length: 30, width: 20, height: 15 };

export const cdekReady = Boolean(
  process.env.CDEK_CLIENT_ID && process.env.CDEK_CLIENT_SECRET,
);

export type CdekCity = { code: number; city: string; region: string };
export type CdekPoint = { code: string; name: string; address: string; workTime: string };
export type CdekTariff = { cost: number; minDays: number; maxDays: number };

let token: { value: string; until: number } | null = null;

async function auth(): Promise<string> {
  if (token && token.until > Date.now()) return token.value;

  const response = await fetch(`${API}/oauth/token?parameters`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.CDEK_CLIENT_ID ?? "",
      client_secret: process.env.CDEK_CLIENT_SECRET ?? "",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`СДЭК: авторизация вернула ${response.status}`);

  const data = (await response.json()) as { access_token: string; expires_in: number };
  // Минута про запас: токен не должен протухнуть между запросом и ответом.
  token = { value: data.access_token, until: Date.now() + (data.expires_in - 60) * 1000 };
  return token.value;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${await auth()}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`СДЭК: ${path} вернул ${response.status}`);
  return response.json() as Promise<T>;
}

export async function cdekCities(query: string): Promise<CdekCity[]> {
  if (query.trim().length < 2) return [];
  const params = new URLSearchParams({
    country_codes: "RU",
    city: query.trim(),
    size: "8",
  });
  const list = await call<{ code: number; city: string; region: string }[]>(
    `/location/cities?${params}`,
  );
  return list.map((item) => ({ code: item.code, city: item.city, region: item.region }));
}

export async function cdekPoints(cityCode: number): Promise<CdekPoint[]> {
  const params = new URLSearchParams({
    city_code: String(cityCode),
    type: "PVZ",
    country_code: "RU",
  });
  const list = await call<
    {
      code: string;
      name: string;
      work_time: string;
      location: { address_full: string };
    }[]
  >(`/deliverypoints?${params}`);

  return list.map((item) => ({
    code: item.code,
    name: item.name,
    address: item.location.address_full,
    workTime: item.work_time,
  }));
}

export async function cdekTariff(
  cityCode: number,
  mode: "pvz" | "courier",
  places: number,
): Promise<CdekTariff> {
  const data = await call<{
    delivery_sum: number;
    period_min: number;
    period_max: number;
  }>("/calculator/tariff", {
    method: "POST",
    body: JSON.stringify({
      tariff_code: CDEK_TARIFF[mode],
      from_location: { code: CDEK_FROM_CITY },
      to_location: { code: cityCode },
      packages: Array.from({ length: Math.max(1, places) }, () => CDEK_PACKAGE),
    }),
  });

  return {
    cost: Math.round(data.delivery_sum),
    minDays: data.period_min,
    maxDays: data.period_max,
  };
}
