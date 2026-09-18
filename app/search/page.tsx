import type { ExplorerParams } from "@/components/explorer";
import { Explorer } from "@/components/explorer";

export default async function SearchPage({ searchParams }: { searchParams: Promise<ExplorerParams> }) {
  const params = await searchParams;
  return <main><Explorer params={params} title={params.q ? `Resultados para “${params.q}”` : "Explorar conocimiento"} /></main>;
}
