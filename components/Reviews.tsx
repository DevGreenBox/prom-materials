import Link from "next/link";

import reviewsData from "@/content/reviews.json";
import summaryData from "@/content/reviews-summary.json";
import { ReviewFeed } from "@/components/ReviewFeed";
import { Star } from "@/components/icons";
import { Empty, MoreLink, SectionTitle } from "@/components/ui";
import { plural } from "@/lib/format";

export type Review = {
  id: number;
  author: string;
  rating: number | null;
  date: string;
  text: string;
  item: string | null;
};

export const reviews = reviewsData as Review[];
export const reviewsSummary = summaryData as {
  rating: number | null;
  count: number | null;
  updatedAt?: string;
};

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Отзывы настоящие: выгружаются скриптом из профиля продавца
 * (`scripts/fetch-avito-reviews.mjs`) в `content/reviews.json`, руками
 * не пишутся. На главной шесть последних, полный список — на `/reviews`.
 */
export function Reviews() {
  return (
    <>
      <SectionTitle action={<MoreLink href="/reviews">Все отзывы</MoreLink>}>
        Что говорят покупатели
      </SectionTitle>

      <RatingSummary />

      {reviews.length === 0 ? (
        <Empty
          title="Отзывы появятся здесь"
          hint="Мы собираем их у покупателей после отгрузки."
        />
      ) : (
        <ReviewFeed reviews={reviews.slice(0, 18)} />
      )}
    </>
  );
}

/** Средняя оценка и число отзывов — одной строкой, звёздами и цифрой. */
export function RatingSummary({ large = false }: { large?: boolean }) {
  const { rating, count } = reviewsSummary;
  if (rating === null) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <span
        className={
          large
            ? "text-[46px] font-semibold leading-none tracking-[-0.03em]"
            : "text-[28px] font-semibold leading-9 tracking-[-0.02em]"
        }
      >
        {rating.toFixed(1).replace(".", ",")}
      </span>
      <Rating value={rating} className={large ? "size-6" : "size-5"} />
      <span className="text-ink-2">
        по {count} {plural(count ?? 0, "отзыву", "отзывам", "отзывам")}
      </span>
    </div>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <li className="border-b border-line py-5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium">{review.author}</span>
        {review.rating !== null && <Rating value={review.rating} />}
      </div>
      <p className="mt-1 text-sm text-ink-3">
        {dateFormat.format(new Date(review.date))}
      </p>
      <p className="mt-2 text-ink-2">{review.text}</p>
      {review.item && (
        /* Название позиции из отзыва — живая ссылка в каталог: человек
           прочитал, что у нас берут, и сразу видит, что это такое. */
        <p className="mt-2 text-sm">
          <Link
            href={`/search?q=${encodeURIComponent(review.item)}`}
            className="text-ink-3 underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
          >
            {review.item}
          </Link>
        </p>
      )}
    </li>
  );
}

/**
 * Оценка звёздами. Заполненные — по округлённой оценке, остальные контурные:
 * пять одинаковых силуэтов читаются быстрее, чем «4,9 из 5» цифрами.
 * Число остаётся в `aria-label` — скринридеру звёзды ни о чём не говорят.
 */
function Rating({
  value,
  className = "size-4",
}: {
  value: number;
  className?: string;
}) {
  const filled = Math.round(value);
  return (
    <span
      className="inline-flex shrink-0 items-center gap-0.5 text-accent"
      aria-label={`Оценка ${value.toFixed(1).replace(".", ",")} из 5`}
      role="img"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} filled={star <= filled} className={className} />
      ))}
    </span>
  );
}
