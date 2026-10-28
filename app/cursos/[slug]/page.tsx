import { notFound } from "next/navigation";
import { Detail } from "@/components/detail";
import { opportunity } from "@/lib/db/catalog";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const i = await opportunity((await params).slug);
  if (!i || i.kind !== "curso") notFound();
  return {
    alternates: { canonical: `/cursos/${i.slug}` },
    title: i?.title || "Curso não encontrado",
    description: i?.description.slice(0, 160),
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <Detail slug={(await params).slug} course />;
}
