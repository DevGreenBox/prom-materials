import type { Metadata } from "next";

import { Breadcrumbs, Container } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Условия продажи",
  robots: { index: false, follow: true },
};

export default function OfferPage() {
  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs
        items={[{ href: "/", name: "Главная" }, { name: "Условия продажи" }]}
      />

      <h1 className="h1">Условия продажи</h1>

      <div className="mt-3 max-w-[68ch] space-y-4 text-base text-ink-2">
        <p className="rounded-md bg-surface px-4 py-3">
          Черновик. Итоговые условия и договор поставки готовит {site.legalName}
          .
        </p>
        <p>
          Информация на сайте не является публичной офертой. Цены в каталоге не
          опубликованы: стоимость подтверждает менеджер после запроса.
        </p>
        <p>
          Заказ считается принятым после подтверждения состава и сроков. Для
          юридических лиц отгрузка производится после оплаты счёта.
        </p>
        <p>
          Возврат товара надлежащего качества — по договорённости, товара
          ненадлежащего качества — в порядке, установленном законом.
          Оборудование с истёкшим сроком поверки и следами монтажа возврату не
          подлежит.
        </p>
        <p>
          Гарантия на оборудование — гарантия производителя. Сроки и условия
          указываются в паспорте изделия.
        </p>
      </div>
    </Container>
  );
}
