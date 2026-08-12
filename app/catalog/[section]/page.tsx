import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Catalog } from "@/components/Catalog";
import { Breadcrumbs, Container } from "@/components/ui";
import { countIn, getSection, productsOf, sections } from "@/lib/catalog";

export function generateStaticParams() {
  return sections.map((section) => ({ section: section.slug }));
}

export async function generateMetadata(
  props: PageProps<"/catalog/[section]">,
): Promise<Metadata> {
  const { section: slug } = await props.params;
  const section = getSection(slug);
  if (!section) return {};
  return {
    title: section.name,
    description: section.summary,
    alternates: { canonical: `/catalog/${section.slug}` },
  };
}

export default async function SectionPage(
  props: PageProps<"/catalog/[section]">,
) {
  const { section: slug } = await props.params;
  const section = getSection(slug);
  if (!section) notFound();

  const list = productsOf({ section: section.slug });

  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs
        items={[
          { href: "/", name: "Главная" },
          { href: "/catalog", name: "Каталог" },
          { name: section.name },
        ]}
      />

      <h1 className="h1">{section.name}</h1>
      <p className="mt-3 max-w-[68ch] text-ink-2">{section.summary}</p>

      <ul className="my-6 flex flex-wrap gap-2">
        {section.groups.map((group) => (
          <li key={group.slug}>
            <Link
              href={`/catalog/${section.slug}/${group.slug}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-4 text-base transition-colors duration-150 hover:border-accent hover:text-accent"
            >
              {group.name}
              <span className="font-mono text-xs text-ink-3">
                {countIn({ group: group.slug })}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Catalog products={list} />
    </Container>
  );
}
