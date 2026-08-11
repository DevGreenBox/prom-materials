import type { Metadata } from "next";

import {
  Breadcrumbs,
  ButtonLink,
  Container,
  SectionTitle,
} from "@/components/ui";
import { zones } from "@/lib/delivery";
import { money } from "@/lib/format";

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
        Считается по весу заказа и зоне. Итог виден в корзине.
      </p>

      <section className="mt-10">
        <SectionTitle>Тарифы</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-base">
            <thead>
              <tr className="border-b border-line text-left text-ink-2">
                <th className="py-2 pr-4 font-normal">Направление</th>
                <th className="py-2 pr-4 font-normal">Срок</th>
                <th className="py-2 font-normal">Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone, index) => (
                <tr
                  key={zone.id}
                  className={index % 2 === 1 ? "bg-surface" : undefined}
                >
                  <td className="py-2.5 pr-4">
                    {zone.name}
                    <span className="block text-sm text-ink-3">
                      {zone.note}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">{zone.days}</td>
                  <td className="py-2.5 font-mono">
                    {zone.base === 0 ? "бесплатно" : money(zone.base)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-ink-3">
          Тариф предварительный: окончательные ставки зависят от договора с
          перевозчиком.
        </p>
      </section>

      <section className="mt-12">
        <SectionTitle>Как это работает</SectionTitle>
        {/* Две колонки: строки короткие, и в одну колонку список тянулся
            на всю ширину страницы пустотой справа. Точка — маркер списка,
            выставленный по центру первой строки. */}
        <ul className="grid max-w-[80ch] gap-x-10 gap-y-3 text-base text-ink-2 sm:grid-cols-2">
          {[
            "Ставка зависит от направления, а не от веса заказа.",
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
