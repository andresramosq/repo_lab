import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(2).max(60),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,24}$/),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revisa los datos ingresados." }, { status: 400 });
  const exists = await db.user.findFirst({ where: { OR: [{ email: parsed.data.email }, { username: parsed.data.username }] } });
  if (exists) return NextResponse.json({ error: "El correo o usuario ya está registrado." }, { status: 409 });
  const user = await db.user.create({
    data: { ...parsed.data, passwordHash: await hash(parsed.data.password, 12), password: undefined },
    select: { id: true },
  });
  return NextResponse.json(user, { status: 201 });
}
