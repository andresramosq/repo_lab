import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { postInclude } from "@/lib/content";
import { PostCard } from "@/components/post-card";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await db.user.findUnique({
    where: { username },
    include: { posts: { where: { status: "PUBLISHED" }, include: postInclude, orderBy: { createdAt: "desc" } } },
  });
  if (!user) notFound();
  return (
    <main className="container section">
      <section className="card" style={{ padding: 30, marginBottom: 30 }}>
        <div className="tag">{user.role === "ADMIN" ? "Administrador" : "Miembro"}</div>
        <h1 style={{ marginBottom: 5 }}>{user.name}</h1><p className="muted">@{user.username}</p>
        <p style={{ maxWidth: 650 }}>{user.bio || "Comparte conocimiento práctico con la comunidad."}</p>
        <span className="muted">Miembro desde {new Intl.DateTimeFormat("es", { dateStyle: "long" }).format(user.createdAt)}</span>
      </section>
      <h2>Publicaciones de {user.name}</h2>
      {user.posts.length ? <div className="grid-posts">{user.posts.map(post => <PostCard post={post} key={post.id} />)}</div> : <p className="muted">No hay publicaciones todavía.</p>}
    </main>
  );
}
