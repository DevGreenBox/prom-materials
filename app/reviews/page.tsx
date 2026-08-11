import type { Metadata } from "next";

import { RequestForm } from "@/components/RequestForm";
import { ReviewCard, RatingSummary, reviews } from "@/components/Reviews";
import { Breadcrumbs, Container, Empty, SectionTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Отзывы покупателей",
  description:
    "Отзывы покупателей о поставках промышленной автоматики: оценки, даты и оборудование, которое забирали.",
  alternates: { canonical: "/reviews" },
};

export default function ReviewsPage() {
  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs items={[{ href: "/", name: "Главная" }, { name: "Отзывы" }]} />

      <h1 className="h1">Отзывы покупателей</h1>

      <div className="mt-6 border-y border-line py-6">
        <RatingSummary large />
      </div>

      {reviews.length === 0 ? (
        <div className="mt-8">
          <Empty
            title="Отзывы появятся здесь"
            hint="Мы собираем их у покупателей после отгрузки."
          />
        </div>
      ) : (
        <ul className="mt-2 grid gap-x-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </ul>
      )}

      <section className="mt-12 max-w-[46rem]">
        <SectionTitle>Хотите так же — напишите нам</SectionTitle>
        <RequestForm topic="Вопрос со страницы отзывов" />
      </section>
    </Container>
  );
}
