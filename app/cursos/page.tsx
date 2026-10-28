import { Catalog } from "@/components/ui";
import type { Params } from "@/lib/db/catalog";
export const metadata = {
  alternates: { canonical: "/cursos" },
  title: "Cursos gratuitos",
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  return (
    <div className="content-shell">
      <Catalog params={await searchParams} course />
    </div>
  );
}
