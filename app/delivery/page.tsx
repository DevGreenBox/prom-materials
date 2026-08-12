import type { Metadata } from "next";

import {
  Breadcrumbs,
  ButtonLink,
  Container,
  SectionTitle,
} from "@/components/ui";
import { deliveryModes } from "@/lib/delivery";

export const metadata: Metadata = {
  title: "Доставка",
  description:
    "Самовывоз на Бурцевской улице, курьер по Москве и области, транспортные компании в регионы. Стоимость считается в корзине.",
};

export default function DeliveryPage() {
  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs
        items={[{ href: "/", name: "Главная" }, { name: "Доставка" }]}
      />

      <h1 className="h1">Доставка</h1>
      <p className="mt-3 max-w-[68ch] text-ink-2">
        Самовывоз со склада или СДЭК по России. Стоимость считает СДЭК
        по выбранному городу — итог виден в корзине.
      </p>

      <section className="mt-10">
        <SectionTitle>Способы</SectionTitle>
        <dl className="grid gap-5 sm:grid-cols-3">
          {deliveryModes.map((mode) => (
            <div key={mode.id} className="rounded-md border border-line p-5">
              <dt className="text-base font-medium">{mode.name}</dt>
              <dd className="mt-2 text-xl font-semibold">
                {mode.id === "pickup" ? "бесплатно" : "по тарифу СДЭК"}
              </dd>
              <dd className="mt-1 text-base text-ink-2">{mode.note}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-ink-3">
          Стоимость и срок доставки СДЭК считаются в корзине после выбора
          города и пункта выдачи — тарифы берутся у перевозчика, а не из
          таблицы на сайте.
        </p>
      </section>

      <section className="mt-12">
        <SectionTitle>Как это работает</SectionTitle>
        {/* Две колонки: строки короткие, и в одну колонку список тянулся
            на всю ширину страницы пустотой справа. Точка — маркер списка,
            выставленный по центру первой строки. */}
        <ul className="grid max-w-[80ch] gap-x-10 gap-y-3 text-base text-ink-2 sm:grid-cols-2">
          {[
            "Стоимость считает СДЭК по городу и пункту выдачи.",
            "Крупногабаритное оборудование отгружается транспортной компанией.",
            "Самовывоз на Бурцевской — в день заказа.",
            "Позиции под заказ отгружаются после поступления.",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span
                aria-hidden
                className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <ButtonLink href="/payment" variant="secondary">
            Способы оплаты
          </ButtonLink>
        </div>
      </section>
    </Container>
  );
}
