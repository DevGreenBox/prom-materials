import type { Metadata } from "next";

import { RequestForm } from "@/components/RequestForm";
import { Breadcrumbs, Container, SectionTitle } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Телефон, почта и адрес. Заявка на подбор и просчёт позиций.",
};

export default function ContactsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.legalName,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address,
      addressCountry: "RU",
    },
  };

  return (
    <Container className="py-8 lg:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs
        items={[{ href: "/", name: "Главная" }, { name: "Контакты" }]}
      />

      <h1 className="h1">Контакты</h1>

      <div className="mt-8 grid gap-x-5 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <dl className="space-y-5">
            <div>
              <dt className="text-sm text-ink-3">Телефон</dt>
              <dd className="text-xl font-medium">
                <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}>
                  {site.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-3">Почта</dt>
              <dd className="text-xl font-medium">
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-3">Склад</dt>
              <dd className="text-xl font-medium">{site.address}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-3">Часы работы</dt>
              <dd className="text-xl font-medium">{site.hours}</dd>
            </div>
          </dl>

          <p className="mt-6 rounded-md bg-surface px-4 py-3 text-sm text-ink-2">
            Почта и реквизиты пока условные: заказчик их не давал.
          </p>
        </div>

        <div className="lg:col-span-7">
          <SectionTitle>Написать нам</SectionTitle>
          <RequestForm topic="Вопрос с сайта" />
        </div>
      </div>
    </Container>
  );
}
