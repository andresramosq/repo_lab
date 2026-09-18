import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("vote"), value: z.enum(["USEFUL", "NOT_USEFUL"]) }),
  z.object({ action: z.literal("favorite") }),
  z.object({ action: z.literal("comment"), body: z.string().trim().min(2).max(1500) }),
  z.object({ action: z.literal("report"), reason: z.string().trim().min(5).max(500) }),
]);

export async function POST(request: Request, { params }: Context) {
  const session = await getAuth();
  if (!session) return NextResponse.json({ error: "Inicia sesión para continuar." }, { status: 401 });
  const { id: postId } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  const userId = session.user.id;

  if (parsed.data.action === "vote") {
    await db.vote.upsert({
      where: { userId_postId: { userId, postId } },
      create: { userId, postId, value: parsed.data.value },
      update: { value: parsed.data.value },
    });
  } else if (parsed.data.action === "favorite") {
    const existing = await db.favorite.findUnique({ where: { userId_postId: { userId, postId } } });
    if (existing) await db.favorite.delete({ where: { userId_postId: { userId, postId } } });
    else await db.favorite.create({ data: { userId, postId } });
  } else if (parsed.data.action === "comment") {
    await db.comment.create({ data: { userId, postId, body: parsed.data.body } });
  } else {
    await db.report.upsert({
      where: { userId_postId: { userId, postId } },
      create: { userId, postId, reason: parsed.data.reason },
      update: { reason: parsed.data.reason, status: "OPEN" },
    });
  }
  return NextResponse.json({ ok: true });
}
