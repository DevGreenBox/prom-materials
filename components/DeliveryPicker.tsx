"use client";

import { useEffect, useId, useState } from "react";

import { Select } from "@/components/ui";
import {
  deliveryModes,
  pickup,
  type Delivery,
  type DeliveryMode,
} from "@/lib/delivery";
import { money } from "@/lib/format";
import { setDelivery, useStore } from "@/lib/store";

type City = { code: number; city: string; region: string };
type Point = { code: string; name: string; address: string; workTime: string };

/**
 * Выбор доставки: город → способ → пункт выдачи, и сразу посчитанная СДЭК
 * стоимость со сроком. Раньше здесь стояла таблица фиксированных ставок
 * по зонам — покупатель платил не то, что видел.
 *
 * Если ключи интеграции не подключены, сервер отвечает 503: тогда блок
 * оставляет самовывоз и предлагает расчёт через менеджера, но не показывает
 * выдуманных цифр.
 */
export function DeliveryPicker({ places }: { places: number }) {
  const { delivery, ready } = useStore();
  const fieldId = useId();

  // Введённый текст держим отдельно и только пока он есть: иначе
  // приходится синхронизировать состояние со стором эффектом, а это
  // лишний каскад перерисовок.
  const [query, setQuery] = useState<string | null>(null);
  const text = query ?? delivery.cityName;
  const [cities, setCities] = useState<City[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "off" | "error">("idle");

  // Подсказка городов: запрос уходит через треть секунды после ввода,
  // иначе на каждую букву получается отдельное обращение к СДЭК.
  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const value = (query ?? "").trim();
      if (value.length < 2 || value === delivery.cityName) {
        setCities([]);
        return;
      }
      const response = await fetch(`/api/cdek?action=cities&q=${encodeURIComponent(value)}`);
      if (response.status === 503) return setStatus("off");
      if (!response.ok) return setStatus("error");
      setCities(await response.json());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [query, delivery.cityName]);

  async function recalc(next: Delivery) {
    if (next.mode === "pickup" || !next.cityCode) {
      setDelivery(next);
      return;
    }

    setStatus("loading");
    const response = await fetch(
      `/api/cdek?action=tariff&city=${next.cityCode}&mode=${next.mode}&places=${places}`,
    );
    if (response.status === 503) {
      setStatus("off");
      return setDelivery({ ...next, cost: 0, days: "" });
    }
    if (!response.ok) {
      setStatus("error");
      return setDelivery({ ...next, cost: 0, days: "" });
    }

    const tariff = (await response.json()) as {
      cost: number;
      minDays: number;
      maxDays: number;
    };
    setStatus("idle");
    setDelivery({
      ...next,
      cost: tariff.cost,
      days:
        tariff.minDays === tariff.maxDays
          ? `${tariff.maxDays} дн.`
          : `${tariff.minDays}–${tariff.maxDays} дн.`,
    });
  }

  async function chooseCity(city: City) {
    setQuery(city.city);
    setCities([]);
    const next: Delivery = {
      ...delivery,
      cityCode: city.code,
      cityName: city.city,
      pointCode: null,
      pointAddress: "",
    };

    if (next.mode === "pvz") {
      const response = await fetch(`/api/cdek?action=points&city=${city.code}`);
      setPoints(response.ok ? await response.json() : []);
    }
    await recalc(next);
  }

  async function chooseMode(mode: DeliveryMode) {
    if (mode === "pickup") {
      setPoints([]);
      setDelivery(pickup);
      return;
    }

    const next: Delivery = { ...delivery, mode, pointCode: null, pointAddress: "" };
    if (mode === "pvz" && next.cityCode && points.length === 0) {
      const response = await fetch(`/api/cdek?action=points&city=${next.cityCode}`);
      setPoints(response.ok ? await response.json() : []);
    }
    await recalc(next);
  }

  if (!ready) return <div className="skeleton h-40 rounded-md" />;

  return (
    <div>
      <div className="space-y-2">
        {deliveryModes.map((mode) => (
          <label
            key={mode.id}
            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors duration-150 ${
              delivery.mode === mode.id
                ? "border-accent bg-accent-soft"
                : "border-line hover:border-accent"
            }`}
          >
            <input
              type="radio"
              name="delivery-mode"
              checked={delivery.mode === mode.id}
              onChange={() => chooseMode(mode.id)}
              className="size-4 accent-[var(--color-accent)]"
            />
            <span className="flex-1">
              <span className="block text-base">{mode.name}</span>
              <span className="block text-sm text-ink-2">{mode.note}</span>
            </span>
            {mode.id === "pickup" && (
              <span className="font-medium">бесплатно</span>
            )}
          </label>
        ))}
      </div>

      {delivery.mode !== "pickup" && (
        <div className="mt-4 space-y-4">
          <div className="relative">
            <label
              htmlFor={`${fieldId}-city`}
              className="mb-1.5 block text-sm text-ink-2"
            >
              Город
            </label>
            <input
              id={`${fieldId}-city`}
              value={text}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Начните вводить город"
              autoComplete="off"
              className="h-11 w-full rounded-md border border-line bg-page px-3 text-base outline-none transition-colors duration-150 placeholder:text-ink-3 focus:border-accent"
            />
            {cities.length > 0 && (
              <ul className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-line bg-page shadow-[0_8px_24px_rgba(22,32,43,0.12)]">
                {cities.map((city) => (
                  <li key={city.code}>
                    <button
                      type="button"
                      onClick={() => chooseCity(city)}
                      className="block w-full border-b border-line px-4 py-2.5 text-left text-base transition-colors last:border-0 hover:bg-surface"
                    >
                      {city.city}
                      <span className="ml-2 text-sm text-ink-3">{city.region}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {delivery.mode === "pvz" && delivery.cityCode && (
            <div>
              <label
                htmlFor={`${fieldId}-point`}
                className="mb-1.5 block text-sm text-ink-2"
              >
                Пункт выдачи
              </label>
              <Select
                id={`${fieldId}-point`}
                className="w-full"
                value={delivery.pointCode ?? ""}
                onChange={(event) => {
                  const point = points.find((item) => item.code === event.target.value);
                  if (!point) return;
                  recalc({
                    ...delivery,
                    pointCode: point.code,
                    pointAddress: point.address,
                  });
                }}
              >
                <option value="">
                  {points.length > 0 ? "Выберите пункт" : "Пунктов не нашлось"}
                </option>
                {points.map((point) => (
                  <option key={point.code} value={point.code}>
                    {point.address}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 border-t border-line pt-4 text-base">
        {status === "off" ? (
          <p className="text-ink-2">
            Расчёт СДЭК пока не подключён. Выберите самовывоз или оформите
            заказ — менеджер посчитает доставку и пришлёт счёт.
          </p>
        ) : status === "error" ? (
          <p className="text-warn">
            СДЭК не ответил. Попробуйте ещё раз или оформите заказ — посчитаем
            вручную.
          </p>
        ) : delivery.mode === "pickup" ? (
          <p className="flex justify-between gap-4">
            <span className="text-ink-2">Самовывоз, {delivery.days}</span>
            <span className="font-medium">бесплатно</span>
          </p>
        ) : status === "loading" ? (
          <p className="text-ink-2">Считаем…</p>
        ) : delivery.days ? (
          <>
            <p className="flex justify-between gap-4">
              <span className="text-ink-2">Доставка, {delivery.days}</span>
              <span className="font-medium tabular">{money(delivery.cost)}</span>
            </p>
            <p className="mt-2 text-sm text-ink-3">
              {/* Массы позиций в объявлениях нет — допущение названо вслух. */}
              Расчёт по {places}{" "}
              {places === 1 ? "месту" : "местам"} весом 3 кг. Точный вес
              подтвердит менеджер, стоимость может измениться.
            </p>
          </>
        ) : (
          <p className="text-ink-2">
            Выберите город{delivery.mode === "pvz" ? " и пункт выдачи" : ""} —
            посчитаем стоимость.
          </p>
        )}
      </div>
    </div>
  );
}
