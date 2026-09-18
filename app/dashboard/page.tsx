import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { postInclude, score } from "@/lib/content";
import { PostCard } from "@/components/post-card";

export default async function DashboardPage() {
  const session = await getAuth();
  if (!session) redirect("/login");
  const [posts, favorites] = await Promise.all([
    db.post.findMany({ where: { authorId: session.user.id }, include: postInclude, orderBy: { updatedAt: "desc" } }),
    db.favorite.findMany({ where: { userId: session.user.id }, include: { post: { include: postInclude } }, orderBy: { createdAt: "desc" } }),
  ]);
  const views = posts.reduce((n, p) => n + p.views, 0);
  const votes = posts.reduce((n, p) => n + score(p.votes), 0);
  return (
    <main className="container section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><h1>Tu panel</h1><p className="muted">Hola, {session.user.name}. Este es el impacto de lo que compartes.</p></div><Link className="btn" href="/posts/new">Nueva publicación</Link></div>
      <div className="summary-grid" style={{ margin: "25px 0 40px" }}>
        {[["Publicaciones", posts.length], ["Vistas", views], ["Puntuación", votes]].map(([label, value]) => <div className="card" style={{ padding: 20 }} key={label}><div className="muted">{label}</div><strong style={{ fontSize: 30 }}>{value}</strong></div>)}
      </div>
      <h2>Mis publicaciones</h2>
      {posts.length ? <div className="grid-posts">{posts.map(post => <div key={post.id}><PostCard post={post} /><div style={{ marginTop: 7 }}><span className="tag">{post.status === "DRAFT" ? "Borrador" : "Publicada"}</span> <Link href={`/posts/${post.slug}/edit`}>Editar</Link></div></div>)}</div> : <p className="muted">Aún no has publicado nada.</p>}
      <h2 style={{ marginTop: 45 }}>Guardados</h2>
      {favorites.length ? <div className="grid-posts">{favorites.map(({ post }) => <PostCard post={post} key={post.id} />)}</div> : <p className="muted">Guarda recursos para encontrarlos aquí.</p>}
    </main>
  );
}
