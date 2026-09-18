import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { postSchema, slugify, uniqueSlug } from "@/lib/content";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  const session = await getAuth();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id } = await params;
  const current = await db.post.findUnique({ where: { id }, select: { authorId: true } });
  if (!current || (current.authorId !== session.user.id && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No tienes permiso." }, { status: 403 });
  }
  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const { tags, images, categoryId, ...data } = parsed.data;
  const post = await db.$transaction(async (tx) => {
    await tx.postTag.deleteMany({ where: { postId: id } });
    await tx.image.deleteMany({ where: { postId: id } });
    return tx.post.update({
      where: { id },
      data: {
        ...data, categoryId, slug: await uniqueSlug(data.title, id),
        tags: { create: tags.map((name) => ({ tag: { connectOrCreate: {
          where: { slug: slugify(name) }, create: { name: name.toLowerCase(), slug: slugify(name) },
        } } })) },
        images: { create: images.map((url) => ({ url })) },
      },
    });
  });
  return NextResponse.json({ slug: post.slug });
}

export async function DELETE(_: Request, { params }: Context) {
  const session = await getAuth();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id }, select: { authorId: true } });
  if (!post || (post.authorId !== session.user.id && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No tienes permiso." }, { status: 403 });
  }
  await db.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
