import type { Metadata } from "next";

import { RequestForm } from "@/components/RequestForm";
import { Breadcrumbs, Container, SectionTitle } from "@/components/ui";
import { money } from "@/lib/format";
import { wholesaleTiers } from "@/lib/site";

export const metadata: Metadata = {
  title: "Оптом и юридическим лицам",
  description:
    "Работа с юридическими лицами: счёт, накладная и УПД из личного кабинета, оптовые скидки, самовывоз и доставка до терминала транспортной компании.",
};

const steps = [
  {
    title: "Заявка",
    text: "Присылаете список позиций, артикулы или параметры — подбираем и считаем.",
  },
  {
    title: "Счёт",
    text: "Выставляем счёт на организацию. Реквизиты сохраняются в личном кабинете.",
  },
  {
    title: "Отгрузка",
    text: "Собираем заказ, формируем накладную и УПД, передаём перевозчику.",
  },
];

export default function CorporatePage() {
  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs
        items={[{ href: "/", name: "Главная" }, { name: "Оптом и юрлицам" }]}
      />

      <h1 className="h1">Оптом и юридическим лицам</h1>
      <p className="mt-3 max-w-[68ch] text-ink-2">
        Работаем с монтажными организациями, производствами и подрядчиками.
        Документы формируются на сайте, отгрузка — самовывозом или до терминала
        транспортной компании.
      </p>

      <section className="mt-10">
        <SectionTitle>Скидки от объёма</SectionTitle>
        <dl className="grid gap-5 sm:grid-cols-3">
          {wholesaleTiers.map((tier) => (
            <div
              key={tier.from}
              className="rounded-md bg-accent-soft px-5 py-6 text-center"
            >
              <dt className="text-sm text-ink-2">от {money(tier.from)}</dt>
              <dd className="mt-1 text-[28px] font-semibold text-accent">
                −{tier.discount}%
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-ink-3">
          Пороги предварительные: окончательные условия закрепляются в договоре.
        </p>
      </section>

      <section className="mt-12">
        <SectionTitle>Как проходит заказ</SectionTitle>
        <ol className="grid gap-5 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className="font-mono text-sm text-ink-3">0{index + 1}</span>
              <h3 className="mt-1 font-medium">{step.title}</h3>
              <p className="mt-1 text-base text-ink-2">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 max-w-[46rem]">
        <SectionTitle>Запросить коммерческое предложение</SectionTitle>
        <RequestForm topic="Коммерческое предложение" />
      </section>
    </Container>
  );
}
