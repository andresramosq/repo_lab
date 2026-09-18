import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostForm } from "@/components/post-form";

export default async function NewPostPage() {
  if (!(await getAuth())) redirect("/login?callbackUrl=/posts/new");
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  return <main className="container" style={{ padding: "45px 0" }}><h1>Compartir conocimiento</h1><p className="muted">Explica el contexto, agrega el prompt y ayuda a otros a usarlo.</p><PostForm categories={categories} /></main>;
}
