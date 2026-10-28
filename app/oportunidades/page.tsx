import { Catalog } from "@/components/ui";
import type { Params } from "@/lib/db/catalog";
export const metadata = {
  alternates: { canonical: "/oportunidades" },
  title: "Oportunidades em Sergipe",
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  return (
    <div className="content-shell">
      <Catalog params={await searchParams} />
    </div>
  );
}
