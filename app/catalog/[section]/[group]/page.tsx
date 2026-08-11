import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Catalog } from "@/components/Catalog";
import { Breadcrumbs, Container } from "@/components/ui";
import { getGroup, getSection, productsOf, sections } from "@/lib/catalog";

export function generateStaticParams() {
  return sections.flatMap((section) =>
    section.groups.map((group) => ({
      section: section.slug,
      group: group.slug,
    })),
  );
}

export async function generateMetadata(
  props: PageProps<"/catalog/[section]/[group]">,
): Promise<Metadata> {
  const { section: sectionSlug, group: groupSlug } = await props.params;
  const section = getSection(sectionSlug);
  const group = section && getGroup(section, groupSlug);
  if (!section || !group) return {};

  const count = productsOf({ group: group.slug }).length;
  return {
    title: `${group.name} — ${section.name}`,
    description: `${group.name}: ${count} позиций в наличии и под заказ. Подбор по току, напряжению, мощности и количеству полюсов.`,
    alternates: { canonical: `/catalog/${section.slug}/${group.slug}` },
  };
}

export default async function GroupPage(
  props: PageProps<"/catalog/[section]/[group]">,
) {
  const { section: sectionSlug, group: groupSlug } = await props.params;
  const section = getSection(sectionSlug);
  const group = section && getGroup(section, groupSlug);
  if (!section || !group) notFound();

  const list = productsOf({ group: group.slug });

  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumbs
        items={[
          { href: "/", name: "Главная" },
          { href: "/catalog", name: "Каталог" },
          { href: `/catalog/${section.slug}`, name: section.name },
          { name: group.name },
        ]}
      />

      <div className="mb-6 flex flex-wrap items-baseline gap-3">
        <h1 className="h1">{group.name}</h1>
        <span className="font-mono text-sm text-ink-3">
          {list.length} позиций
        </span>
      </div>

      <Catalog products={list} />
    </Container>
  );
}
