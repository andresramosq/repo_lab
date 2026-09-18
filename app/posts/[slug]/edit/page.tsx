import { notFound, redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostForm } from "@/components/post-form";

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getAuth();
  if (!session) redirect("/login");
  const { slug } = await params;
  const [post, categories] = await Promise.all([
    db.post.findUnique({ where: { slug }, include: { tags: { include: { tag: true } }, images: true } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!post) notFound();
  if (post.authorId !== session.user.id && session.user.role !== "ADMIN") redirect(`/posts/${slug}`);
  return <main className="container" style={{ padding: "45px 0" }}><h1>Editar publicación</h1><PostForm categories={categories} initial={{
    id: post.id, title: post.title, summary: post.summary, content: post.content, prompt: post.prompt,
    useCase: post.useCase, categoryId: post.categoryId, tags: post.tags.map(x => x.tag.name),
    images: post.images.map(x => x.url), status: post.status,
  }} /></main>;
}
