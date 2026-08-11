"use client";

import { useState } from "react";

import { deliveryCost, zones } from "@/lib/delivery";
import { money } from "@/lib/format";
import { setZone, useStore } from "@/lib/store";
import { wholesaleTiers } from "@/lib/site";

const field =
  "h-11 w-full rounded-md border border-line bg-page px-3 text-base outline-none transition-colors duration-150 focus:border-accent";

/**
 * Скидка от суммы заказа. Пороги условные (правило заказчик не задал),
 * но считает по тем же данным, что и страница «Оптом и юрлицам»:
 * появится настоящее правило — поменяется только `wholesaleTiers`.
 */
export function WholesaleCalculator() {
  const [sum, setSum] = useState(200_000);
  const tier = [...wholesaleTiers].reverse().find((item) => sum >= item.from);
  const next = wholesaleTiers.find((item) => sum < item.from);
  const last = wholesaleTiers[wholesaleTiers.length - 1];

  return (
    <div className="mt-8 lg:mt-0 lg:w-[380px]">
      <label htmlFor="wholesale-sum" className="mb-2 block text-sm text-ink-2">
        Сумма заказа, ₽
      </label>
      {/* Поле текстовое, а не number: «200000» в поле рядом с «150 000 ₽»
          в тексте — самый заметный признак недоделанного прототипа. */}
      <input
        id="wholesale-sum"
        type="text"
        inputMode="numeric"
        value={new Intl.NumberFormat("ru-RU").format(sum)}
        onChange={(event) =>
          setSum(
            Math.min(
              99_000_000,
              Number(event.target.value.replace(/\D/g, "")) || 0,
            ),
          )
        }
        className={`${field} tabular`}
      />

      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-[46px] font-semibold tracking-[-0.03em] text-accent">
          −{tier?.discount ?? 0}%
        </span>
        <span className="text-sm text-ink-2">
          {tier
            ? `при сумме от ${money(tier.from)}`
            : "скидка начинается с оптового объёма"}
        </span>
      </div>

      {/* Шкала порогов: три засечки и заливка до текущей суммы. Одной строкой
          «до −5% не хватает 40 000 ₽» видно, что дальше, но не видно, где ты
          на всей лестнице. */}
      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${Math.min(100, (sum / last.from) * 100)}%` }}
          />
        </div>
        <ul className="mt-2 flex justify-between text-xs">
          {wholesaleTiers.map((item) => (
            <li
              key={item.from}
              className={
                sum >= item.from
                  ? "font-medium text-accent"
                  : "text-ink-3"
              }
            >
              −{item.discount}% от {money(item.from)}
            </li>
          ))}
        </ul>
      </div>

      {next && (
        <p className="mt-3 text-sm text-ink-2">
          До −{next.discount}% не хватает{" "}
          <span className="font-medium text-ink tabular">
            {money(next.from - sum)}
          </span>
        </p>
      )}

      <p className="mt-3 text-sm text-ink-3">
        Пороги предварительные: окончательные условия закрепляются в договоре.
      </p>
    </div>
  );
}

/**
 * Направления доставки. Не таблица, а выбор: отмеченное направление
 * запоминается и подставляется в корзину — иначе человек прочитал ставку
 * и всё равно выбирает её заново на оформлении.
 *
 * Поля «вес заказа» здесь нет: массы позиций в объявлениях не указаны,
 * а считать по выдуманному весу — значит показывать цифру, которую никто
 * не подтвердит.
 */
export function DeliveryRates() {
  const { zone: chosen, ready } = useStore();

  return (
    <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
      {zones.map((zone) => {
        const { cost, days } = deliveryCost(zone.id);
        const active = ready && chosen === zone.id;

        return (
          <button
            key={zone.id}
            type="button"
            onClick={() => setZone(zone.id)}
            aria-pressed={active}
            className={`border-t-2 pt-3 text-left transition-colors duration-150 ${
              active
                ? "border-accent"
                : "border-line hover:border-ink-3"
            }`}
          >
            <span className="flex items-baseline gap-2 text-base">
              {zone.name}
              {active && (
                <span className="font-mono text-xs text-accent">выбрано</span>
              )}
            </span>
            <span className="mt-1 block text-xl font-semibold tabular">
              {cost === 0 ? "бесплатно" : money(cost)}
            </span>
            <span className="block text-sm text-ink-2">
              {zone.note}, {days}
            </span>
          </button>
        );
      })}
    </div>
  );
}
