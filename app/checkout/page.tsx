"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Breadcrumbs,
  Button,
  ButtonLink,
  Container,
  Empty,
} from "@/components/ui";
import { getProduct } from "@/lib/catalog";
import { deliveryCost, zones } from "@/lib/delivery";
import { formatPhone, money, plural } from "@/lib/format";
import { FORMS_ARE_MOCKED } from "@/lib/site";
import { placeOrder, setZone, useStore, type Customer } from "@/lib/store";

const field =
  "h-11 w-full rounded-md border border-line bg-page px-3 text-base outline-none transition-colors duration-150 focus:border-accent";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, ready, cartCount, cartSum, zone } = useStore();

  const [kind, setKind] = useState<Customer["kind"]>("person");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const delivery = deliveryCost(zone);
  const needsAddress = zone !== "pickup";

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();

    // Валидация на клиенте — обязательная часть, а не украшение:
    // заявка без телефона или ИНН бесполезна менеджеру.
    const next: Record<string, string> = {};
    if (value("name").length < 2) next.name = "Укажите имя";
    if (value("phone").replace(/\D/g, "").length < 10)
      next.phone = "Укажите телефон";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value("email")))
      next.email = "Укажите почту";
    if (kind === "company") {
      if (value("company").length < 2)
        next.company = "Укажите название организации";
      if (!/^\d{10}(\d{2})?$/.test(value("inn")))
        next.inn = "ИНН — 10 или 12 цифр";
    }
    if (needsAddress && value("address").length < 5)
      next.address = "Укажите адрес доставки";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      // Курсор — в первое поле с ошибкой: иначе на длинной форме
      // приходится искать её глазами.
      const first = Object.keys(next)[0];
      event.currentTarget.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
      return;
    }

    const id = placeOrder({
      customer: {
        kind,
        name: value("name"),
        phone: value("phone"),
        email: value("email"),
        company: kind === "company" ? value("company") : undefined,
        inn: kind === "company" ? value("inn") : undefined,
        address: needsAddress ? value("address") : undefined,
      },
      zone,
      deliveryCost: delivery.cost,
    });

    router.push(`/account/orders/${id}`);
  }

  if (ready && cart.length === 0) {
    return (
      <Container className="py-8 lg:py-10">
        <Breadcrumbs
          items={[{ href: "/", name: "Главная" }, { name: "Оформление" }]}
        />
        <Empty
          title="Нечего оформлять"
          hint="Сначала добавьте позиции в корзину."
        />
        <div className="mt-4">
          <ButtonLink href="/catalog">В каталог</ButtonLink>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs
        items={[
          { href: "/", name: "Главная" },
          { href: "/cart", name: "Корзина" },
          { name: "Оформление" },
        ]}
      />

      <h1 className="h1">Оформление заказа</h1>

      <form
        onSubmit={onSubmit}
        noValidate
        className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-5"
      >
        <div className="space-y-8 lg:col-span-8">
          <fieldset>
            <legend className="mb-3 text-xl font-semibold">Покупатель</legend>
            <div className="mb-4 inline-flex rounded-md border border-line p-1">
              {(["person", "company"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setKind(option)}
                  className={`min-h-9 rounded px-4 text-sm transition-colors duration-150 ${
                    kind === option
                      ? "bg-accent text-white"
                      : "text-ink-2 hover:text-accent"
                  }`}
                >
                  {option === "person" ? "Физическое лицо" : "Юридическое лицо"}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                name="name"
                label="Имя и фамилия"
                error={errors.name}
                autoComplete="name"
              />
              <Field
                name="phone"
                label="Телефон"
                type="tel"
                error={errors.phone}
                autoComplete="tel"
                inputMode="tel"
                placeholder="+7 (900) 000-00-00"
                onInput={(event) => {
                  const input = event.currentTarget;
                  input.value = formatPhone(input.value);
                }}
              />
              <Field
                name="email"
                label="Почта"
                type="email"
                error={errors.email}
                autoComplete="email"
              />
              {kind === "company" && (
                <>
                  <Field
                    name="company"
                    label="Организация"
                    error={errors.company}
                  />
                  <Field
                    name="inn"
                    label="ИНН"
                    error={errors.inn}
                    inputMode="numeric"
                    maxLength={12}
                  />
                </>
              )}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-xl font-semibold">Доставка</legend>
            <div className="space-y-2">
              {zones.map((item) => {
                const cost = deliveryCost(item.id);
                return (
                  <label
                    key={item.id}
                    className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors duration-150 ${
                      zone === item.id
                        ? "border-accent bg-accent-soft"
                        : "border-line hover:border-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="zone"
                      value={item.id}
                      checked={zone === item.id}
                      onChange={() => setZone(item.id)}
                      className="size-4 accent-[var(--color-accent)]"
                    />
                    <span className="flex-1">
                      <span className="block text-base">{item.name}</span>
                      <span className="block text-sm text-ink-2">
                        {item.note}, {item.days}
                      </span>
                    </span>
                    <span className="font-medium tabular">
                      {cost.cost === 0 ? "бесплатно" : money(cost.cost)}
                    </span>
                  </label>
                );
              })}
            </div>

            {needsAddress && (
              <div className="mt-4">
                <Field
                  name="address"
                  label="Адрес доставки"
                  error={errors.address}
                />
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-xl font-semibold">Оплата</legend>
            <p className="text-base text-ink-2">
              {kind === "company"
                ? "Счёт и накладная — в личном кабинете сразу после оформления."
                : "Картой или наличными при получении. Онлайн-оплата пока не подключена."}
            </p>
          </fieldset>
        </div>

        <aside className="mt-8 rounded-md border border-line p-5 lg:col-span-4 lg:sticky lg:top-28 lg:mt-0">
          <h2 className="text-xl font-semibold">Заказ</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {cart.map((line) => {
              const product = getProduct(line.slug);
              if (!product) return null;
              return (
                <li key={line.slug} className="flex justify-between gap-3">
                  <span className="min-w-0 flex-1 truncate text-ink-2">
                    {product.name}
                  </span>
                  <span className="font-mono text-ink-3">
                    {line.qty} {product.unit}
                  </span>
                </li>
              );
            })}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-base">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-2">Позиций</dt>
              <dd className="tabular">
                {cartCount} {plural(cartCount, "штука", "штуки", "штук")}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-2">Товары</dt>
              <dd className="tabular">{money(cartSum)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-2">Доставка</dt>
              <dd className="tabular">
                {delivery.cost === 0 ? "бесплатно" : money(delivery.cost)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 text-xl font-semibold">
              <dt>Итого</dt>
              <dd className="tabular">{money(cartSum + delivery.cost)}</dd>
            </div>
          </dl>

          <Button type="submit" className="mt-5 w-full">
            Оформить заказ
          </Button>

          {FORMS_ARE_MOCKED && (
            <p className="mt-3 text-sm text-ink-3">
              Демо-режим: заказ сохраняется в браузере и наружу не уходит.
            </p>
          )}
        </aside>
      </form>
    </Container>
  );
}

function Field({
  name,
  label,
  error,
  ...rest
}: {
  name: string;
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm text-ink-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${field} ${error ? "border-danger" : ""}`}
        {...rest}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
