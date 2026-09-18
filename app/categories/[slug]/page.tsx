import { notFound } from "next/navigation";
import { Explorer } from "@/components/explorer";
import { db } from "@/lib/db";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) notFound();
  return <main><Explorer params={{ category: slug }} title={category.name} /></main>;
}
