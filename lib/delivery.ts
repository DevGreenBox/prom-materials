/**
 * Способы доставки.
 *
 * Самовывоз бесплатный, остальное считает СДЭК по выбранному городу
 * и пункту выдачи (`lib/cdek.ts`). Фиксированных ставок по зонам больше нет:
 * они не совпадали с тем, что покупатель платит на самом деле.
 */
export type DeliveryMode = "pickup" | "pvz" | "courier";

export const deliveryModes: {
  id: DeliveryMode;
  name: string;
  note: string;
}[] = [
  { id: "pickup", name: "Самовывоз", note: "Бурцевская ул., 7А, в день заказа" },
  { id: "pvz", name: "СДЭК, в пункт выдачи", note: "по России" },
  { id: "courier", name: "СДЭК, курьером до двери", note: "по России" },
];

/** Выбор покупателя: живёт в сторе и уезжает в заказ целиком. */
export type Delivery = {
  mode: DeliveryMode;
  cityCode: number | null;
  cityName: string;
  pointCode: string | null;
  pointAddress: string;
  /** Рассчитанная стоимость. Для самовывоза — ноль. */
  cost: number;
  /** Срок словами: «1–2 дня». Пустая строка, пока расчёта нет. */
  days: string;
};

export const pickup: Delivery = {
  mode: "pickup",
  cityCode: null,
  cityName: "",
  pointCode: null,
  pointAddress: "",
  cost: 0,
  days: "в день заказа",
};

/** Готов ли выбор к оформлению: город и пункт выдачи обязательны для СДЭК. */
export function deliveryReady(delivery: Delivery): boolean {
  if (delivery.mode === "pickup") return true;
  if (!delivery.cityCode) return false;
  return delivery.mode === "courier" || Boolean(delivery.pointCode);
}

/** Строка для заказа и накладной: одним предложением, без сокращений. */
export function deliveryLabel(delivery: Delivery): string {
  if (delivery.mode === "pickup") return "Самовывоз, Бурцевская ул., 7А";

  const where =
    delivery.mode === "courier"
      ? "курьером до двери"
      : `пункт выдачи: ${delivery.pointAddress}`;

  return `СДЭК: ${delivery.cityName}, ${where}`;
}
