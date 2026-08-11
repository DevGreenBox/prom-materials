import type { Metadata } from "next";

import { Breadcrumbs, Container } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Обработка персональных данных",
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs
        items={[
          { href: "/", name: "Главная" },
          { name: "Обработка персональных данных" },
        ]}
      />

      <h1 className="h1">Обработка персональных данных</h1>

      <div className="mt-6 max-w-[68ch] space-y-4 text-base text-ink-2">
        <p className="rounded-md bg-surface px-4 py-3">
          Черновик. Итоговый текст политики готовит {site.legalName} — до
          запуска страницу заменяет юридически выверенный документ.
        </p>
        <p>
          Оставляя заявку или оформляя заказ, вы передаёте имя, телефон, почту,
          а для юридических лиц — название организации и ИНН. Эти данные нужны,
          чтобы связаться с вами, подтвердить состав заказа и оформить
          документы.
        </p>
        <p>
          Данные не передаются третьим лицам, кроме перевозчика — ему сообщается
          то, что необходимо для доставки.
        </p>
        <p>
          В демонстрационной версии сайта формы ничего не отправляют: заказы и
          заявки сохраняются только в вашем браузере.
        </p>
        <p>
          Отозвать согласие или запросить удаление данных можно письмом на{" "}
          <a href={`mailto:${site.email}`} className="text-accent">
            {site.email}
          </a>
          .
        </p>
      </div>
    </Container>
  );
}
