import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-20 text-center lg:py-28">
      <p className="font-mono text-sm text-ink-3">404</p>
      <h1 className="mt-2 h1">Страница не найдена</h1>
      <p className="mx-auto mt-3 max-w-[48ch] text-ink-2">
        Возможно, позиция снята с производства или ссылка устарела. Попробуйте
        найти нужное через каталог или поиск по артикулу.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/catalog">В каталог</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          На главную
        </ButtonLink>
      </div>
    </Container>
  );
}
