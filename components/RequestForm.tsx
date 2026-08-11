"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import { formatPhone } from "@/lib/format";
import { FORMS_ARE_MOCKED } from "@/lib/site";

const field =
  "h-11 w-full rounded-md border border-line bg-page px-3 text-base outline-none transition-colors duration-150 focus:border-accent";

/**
 * Заявка (просчёт, подбор аналога, коммерческое предложение).
 * Отправка отключена: почтового ящика и бота у проекта пока нет,
 * поэтому форма валидируется и подтверждает приём, но никуда не уходит.
 */
export function RequestForm({ topic }: { topic: string }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-md bg-surface p-6">
        <p className="font-medium">Заявка принята</p>
        <p className="mt-1 text-sm text-ink-2">
          {FORMS_ARE_MOCKED
            ? "Демо-режим: письмо никуда не отправлено."
            : "Менеджер ответит в рабочее время."}
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-3 text-sm text-accent transition-colors hover:text-accent-hover"
        >
          Отправить ещё одну
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const value = (name: string) => String(data.get(name) ?? "").trim();

        const next: Record<string, string> = {};
        if (value("name").length < 2) next.name = "Как к вам обращаться?";
        if (value("contact").length < 5)
          next.contact = "Телефон или почта для ответа";
        if (value("message").length < 5)
          next.message = "Опишите, что нужно подобрать";

        setErrors(next);
        if (Object.keys(next).length === 0) setSent(true);
      }}
      className="space-y-4"
    >
      <input type="hidden" name="topic" value={topic} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="rf-name" className="mb-1.5 block text-sm text-ink-2">
            Имя
          </label>
          <input
            id="rf-name"
            name="name"
            className={field}
            autoComplete="name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-danger">{errors.name}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="rf-contact"
            className="mb-1.5 block text-sm text-ink-2"
          >
            Телефон или почта
          </label>
          <input
            id="rf-contact"
            name="contact"
            className={field}
            autoComplete="tel"
            placeholder="+7 (900) 000-00-00 или почта"
            onInput={(event) => {
              // Маска включается, только если набирают цифры: в это же поле
              // можно написать почту.
              const input = event.currentTarget;
              if (/^[\d+ ()-]+$/.test(input.value))
                input.value = formatPhone(input.value);
            }}
          />
          {errors.contact && (
            <p className="mt-1 text-sm text-danger">{errors.contact}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="rf-message" className="mb-1.5 block text-sm text-ink-2">
          Что нужно
        </label>
        <textarea
          id="rf-message"
          name="message"
          rows={4}
          placeholder="Артикулы, номиналы или список позиций"
          className="w-full rounded-md border border-line bg-page px-3 py-2.5 text-base outline-none transition-colors duration-150 placeholder:text-ink-3 focus:border-accent"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-danger">{errors.message}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit">Отправить заявку</Button>
        <p className="text-sm text-ink-3">
          Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
        </p>
      </div>
    </form>
  );
}
