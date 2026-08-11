"use client";

import { useState } from "react";

import { ReviewCard, type Review } from "@/components/Reviews";
import { Button } from "@/components/ui";
import { plural } from "@/lib/format";

const STEP = 6;

/**
 * Лента отзывов на главной. Шесть штук и кнопка «Показать ещё»: блок высотой
 * в пол-экрана, в котором нельзя ничего нажать, читается как картинка.
 * Полный список остаётся на `/reviews` — здесь только ближайшая партия.
 */
export function ReviewFeed({ reviews }: { reviews: Review[] }) {
  const [shown, setShown] = useState(STEP);
  const rest = reviews.length - shown;

  return (
    <>
      <ul className="mt-6 grid gap-x-5 border-t border-line sm:grid-cols-2 lg:grid-cols-3">
        {reviews.slice(0, shown).map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </ul>

      {rest > 0 && (
        <div className="mt-6">
          <Button
            variant="secondary"
            onClick={() => setShown((value) => value + STEP)}
          >
            Показать ещё {Math.min(STEP, rest)}{" "}
            {plural(Math.min(STEP, rest), "отзыв", "отзыва", "отзывов")}
          </Button>
        </div>
      )}
    </>
  );
}
