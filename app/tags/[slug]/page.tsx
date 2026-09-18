import { notFound } from "next/navigation";
import { Explorer } from "@/components/explorer";
import { db } from "@/lib/db";

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await db.tag.findUnique({ where: { slug } });
  if (!tag) notFound();
  return <main><Explorer params={{ tag: slug }} title={`#${tag.name}`} /></main>;
}
