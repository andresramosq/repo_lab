import { z } from "zod";
import { db } from "@/lib/db";

export const postSchema = z.object({
  title: z.string().trim().min(8).max(120),
  summary: z.string().trim().min(20).max(280),
  content: z.string().trim().min(30).max(30000),
  prompt: z.string().trim().min(10).max(20000),
  useCase: z.string().trim().min(10).max(300),
  categoryId: z.string().min(1),
  tags: z.array(z.string().trim().min(2).max(30)).min(1).max(8),
  images: z.array(z.string().startsWith("/uploads/")).max(5).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const slugify = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const postInclude = {
  author: { select: { name: true, username: true, image: true } },
  category: true,
  tags: { include: { tag: true } },
  images: true,
  votes: { select: { value: true, userId: true } },
  favorites: { select: { userId: true } },
  _count: { select: { comments: true } },
} as const;

export async function uniqueSlug(title: string, currentId?: string) {
  const base = slugify(title) || "publicacion";
  let slug = base;
  let suffix = 2;
  while (await db.post.findFirst({ where: { slug, NOT: currentId ? { id: currentId } : undefined }, select: { id: true } })) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

export function score(votes: { value: string }[]) {
  return votes.reduce((sum, vote) => sum + (vote.value === "USEFUL" ? 1 : -1), 0);
}
