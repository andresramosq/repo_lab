import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  const session = await getAuth();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id } = await params;
  const comment = await db.comment.findUnique({ where: { id }, select: { userId: true } });
  if (!comment || (comment.userId !== session.user.id && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No tienes permiso." }, { status: 403 });
  }
  const body = String((await request.json().catch(() => ({}))).body || "").trim();
  if (body.length < 2 || body.length > 1500) return NextResponse.json({ error: "Comentario inválido." }, { status: 400 });
  await db.comment.update({ where: { id }, data: { body } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: Context) {
  const session = await getAuth();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id } = await params;
  const comment = await db.comment.findUnique({ where: { id }, select: { userId: true } });
  if (!comment || (comment.userId !== session.user.id && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No tienes permiso." }, { status: 403 });
  }
  await db.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
