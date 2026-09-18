import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("ban"), userId: z.string(), banned: z.boolean() }),
  z.object({ action: z.literal("resolve"), reportId: z.string() }),
  z.object({ action: z.literal("deletePost"), postId: z.string() }),
]);

export async function POST(request: Request) {
  const session = await getAuth();
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Solo administradores." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
  const data = parsed.data;
  if (data.action === "ban") {
    if (data.userId === session.user.id) return NextResponse.json({ error: "No puedes bloquearte." }, { status: 400 });
    await db.user.update({ where: { id: data.userId }, data: { banned: data.banned } });
  } else if (data.action === "resolve") {
    await db.report.update({ where: { id: data.reportId }, data: { status: "RESOLVED" } });
  } else {
    await db.post.delete({ where: { id: data.postId } });
  }
  return NextResponse.json({ ok: true });
}
