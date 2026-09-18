import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { postSchema, slugify, uniqueSlug } from "@/lib/content";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await getAuth();
  if (!session) return NextResponse.json({ error: "Inicia sesión para publicar." }, { status: 401 });
  if (!rateLimit(`create:${session.user.id}`, 10, 60 * 60_000)) {
    return NextResponse.json({ error: "Has publicado demasiado rápido. Intenta más tarde." }, { status: 429 });
  }
  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const { tags, images, categoryId, ...data } = parsed.data;
  const post = await db.post.create({
    data: {
      ...data,
      slug: await uniqueSlug(data.title),
      authorId: session.user.id,
      categoryId,
      tags: {
        create: tags.map((name) => ({
          tag: { connectOrCreate: { where: { slug: slugify(name) }, create: { name: name.toLowerCase(), slug: slugify(name) } } },
        })),
      },
      images: { create: images.map((url) => ({ url })) },
    },
  });
  return NextResponse.json({ slug: post.slug }, { status: 201 });
}
