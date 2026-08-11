export function plural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function money(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;
}

export function weight(kg: number, per?: string): string {
  const value = `${kg.toFixed(kg < 10 ? 2 : 1).replace(".", ",")} кг`;
  // «1,10 кг» у кабель-канала — это килограммы за метр, а не за бухту.
  return per && per !== "шт" ? `${value} / ${per}` : value;
}

export function date(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "long" }).format(new Date(iso));
}

/** Приводит ввод к «+7 (999) 123-45-67»: менеджеру нужен один формат. */
export function formatPhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  if (!digits.startsWith("7")) digits = `7${digits}`;
  digits = digits.slice(0, 11);

  const [, code = "", a = "", b = "", c = ""] =
    digits.match(/^7(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/) ?? [];

  let out = "+7";
  if (code) out += ` (${code}`;
  if (code.length === 3) out += ")";
  if (a) out += ` ${a}`;
  if (b) out += `-${b}`;
  if (c) out += `-${c}`;
  return out;
}
