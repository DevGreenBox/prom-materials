/**
 * Расчёт стоимости доставки.
 *
 * TODO(client): тариф условный — реальные ставки и перевозчик не согласованы.
 * Массы позиций в объявлениях нет, поэтому вес в расчёте не участвует:
 * ставка зависит только от зоны. Когда появится договор с ТК, меняется
 * таблица `zones`, интерфейс расчёта остаётся прежним.
 */
export type ZoneId = "pickup" | "city" | "region" | "russia";

export const zones: {
  id: ZoneId;
  name: string;
  note: string;
  base: number;
  days: string;
}[] = [
  { id: "pickup", name: "Самовывоз", note: "Бурцевская ул., 7А", base: 0, days: "в день заказа" },
  { id: "city", name: "Москва в пределах МКАД", note: "курьером", base: 700, days: "1 рабочий день" },
  { id: "region", name: "Московская область", note: "курьером", base: 1100, days: "1–2 рабочих дня" },
  { id: "russia", name: "Регионы России", note: "до терминала ТК", base: 1500, days: "3–7 рабочих дней" },
];

export function deliveryCost(zoneId: ZoneId): { cost: number; days: string } {
  const zone = zones.find((item) => item.id === zoneId) ?? zones[0];
  return { cost: zone.base, days: zone.days };
}
