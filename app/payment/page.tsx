import type { Metadata } from "next";

import { Card, Invoice, Papers } from "@/components/icons";
import { Breadcrumbs, ButtonLink, Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Оплата",
  description:
    "Оплата по счёту для юридических лиц, картой или наличными при получении для физических лиц. Накладная и УПД формируются в личном кабинете.",
};

const methods = [
  {
    icon: Invoice,
    title: "Юридическим лицам",
    text: "Счёт на организацию, безналичный расчёт. Накладная и УПД — в личном кабинете.",
  },
  {
    icon: Card,
    title: "Физическим лицам",
    text: "Картой или наличными при получении. Онлайн-оплата пока не подключена.",
  },
  {
    icon: Papers,
    title: "Документы",
    text: "К каждому заказу формируется расходная накладная. Счёт-фактура и УПД — по запросу при отгрузке юрлицу.",
  },
];

export default function PaymentPage() {
  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs
        items={[{ href: "/", name: "Главная" }, { name: "Оплата" }]}
      />

      <h1 className="h1">Оплата</h1>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {methods.map((method) => (
          <section
            key={method.title}
            className="rounded-md border border-line p-5"
          >
            <method.icon className="size-7 text-accent" />
            <h2 className="mt-4 font-medium">{method.title}</h2>
            <p className="mt-1 text-base text-ink-2">{method.text}</p>
          </section>
        ))}
      </div>

      <div className="mt-8">
        <ButtonLink href="/catalog">В каталог</ButtonLink>
      </div>
    </Container>
  );
}
