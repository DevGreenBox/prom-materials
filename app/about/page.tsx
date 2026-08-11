import type { Metadata } from "next";

import { Buildings } from "@/components/icons";
import {
  Breadcrumbs,
  ButtonLink,
  Container,
  SectionTitle,
} from "@/components/ui";
import { sections } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "О компании",
  description:
    "Поставка промышленной автоматики в Москве: КИП и датчики, приводная техника, контроллеры и панели оператора, насосы, пневматика.",
};

export default function AboutPage() {
  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs
        items={[{ href: "/", name: "Главная" }, { name: "О компании" }]}
      />

      <h1 className="h1">О компании</h1>

      <div className="mt-6 gap-x-5 lg:grid lg:grid-cols-12 lg:items-start">
        <div className="space-y-4 text-ink-2 lg:col-span-7">
          <p>
            Поставляем промышленную автоматику и электрооборудование
            в Москве. Работаем с монтажными организациями, производствами
            и частными электриками.
          </p>
          <p>
            Подбор идёт по номиналам: ток, напряжение, мощность, условный
            проход, исполнение. Чего нет в наличии — привозим под заказ или
            предлагаем аналог.
          </p>
        </div>

        {/* Справа от текста — знак из общего набора: рамки нет, чтобы он
            не читался как пустая карточка. Фотографии офиса у нас нет,
            а пустое место рядом с абзацем выглядит как незавёрстанный блок. */}
        <div className="mt-8 flex items-center justify-center lg:col-span-5 lg:mt-0">
          <Buildings className="size-44 text-accent" strokeWidth={0.6} />
        </div>
      </div>

      <section className="mt-12">
        <SectionTitle>Что поставляем</SectionTitle>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <li key={section.slug}>
              <h3 className="font-medium">{section.name}</h3>
              <p className="mt-1 text-base text-ink-2">{section.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 max-w-[68ch]">
        <SectionTitle>Реквизиты</SectionTitle>
        <p className="text-base text-ink-2">
          Реквизиты на сайте демонстрационные.
        </p>
        <div className="mt-6">
          <ButtonLink href="/contacts">Контакты</ButtonLink>
        </div>
      </section>
    </Container>
  );
}
