import Link from "next/link";
import { db } from "@/lib/db";
import { postInclude, score } from "@/lib/content";
import { PostCard } from "@/components/post-card";

export type ExplorerParams = { q?: string; category?: string; tag?: string; order?: string; page?: string };

export async function Explorer({ params = {}, title }: { params?: ExplorerParams; title?: string }) {
  const page = Math.max(1, Number(params.page) || 1);
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  const where = {
    status: "PUBLISHED" as const,
    ...(params.category ? { category: { slug: params.category } } : {}),
    ...(params.tag ? { tags: { some: { tag: { slug: params.tag } } } } : {}),
    ...(params.q ? { OR: [
      { title: { contains: params.q, mode: "insensitive" as const } },
      { summary: { contains: params.q, mode: "insensitive" as const } },
      { content: { contains: params.q, mode: "insensitive" as const } },
      { prompt: { contains: params.q, mode: "insensitive" as const } },
      { tags: { some: { tag: { name: { contains: params.q, mode: "insensitive" as const } } } } },
    ] } : {}),
  };
  const raw = await db.post.findMany({ where, include: postInclude, orderBy: { createdAt: "desc" }, take: 150 });
  const order = params.order || "trending";
  const sorted = [...raw].sort((a, b) => {
    if (order === "useful") return score(b.votes) - score(a.votes);
    if (order === "recent") return b.createdAt.getTime() - a.createdAt.getTime();
    const rank = (p: typeof a) => score(p.votes) * 5 + p.views * .08 + p._count.comments * 2 - (Date.now() - p.createdAt.getTime()) / 86400000 * .15;
    return rank(b) - rank(a);
  });
  const totalPages = Math.max(1, Math.ceil(sorted.length / 12));
  const posts = sorted.slice((page - 1) * 12, page * 12);
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v && v !== String(page)) as [string, string][]);

  return (
    <section className="section">
      <div className="container">
        {title && <h1 style={{ fontSize: 38, marginTop: 0 }}>{title}</h1>}
        <form action="/search" className="card" style={{ padding: 16, display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10, marginBottom: 26 }}>
          <input className="field" name="q" defaultValue={params.q} placeholder="Busca CV, investigación, código..." />
          <select className="field" name="category" defaultValue={params.category || ""}>
            <option value="">Todas las categorías</option>
            {categories.map(c => <option value={c.slug} key={c.id}>{c.name}</option>)}
          </select>
          <select className="field" name="order" defaultValue={order}>
            <option value="trending">Tendencias</option><option value="useful">Más útiles</option><option value="recent">Recientes</option>
          </select>
          <button className="btn">Buscar</button>
        </form>
        {posts.length ? <div className="grid-posts">{posts.map(post => <PostCard post={post} key={post.id} />)}</div> :
          <div className="card" style={{ padding: 50, textAlign: "center" }}><h2>No encontramos publicaciones</h2><p className="muted">Prueba otros términos o comparte el primer recurso sobre este tema.</p><Link href="/posts/new" className="btn">Crear publicación</Link></div>}
        {totalPages > 1 && <nav style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 30 }}>
          {page > 1 && <Link className="btn secondary" href={`?${query}&page=${page - 1}`}>Anterior</Link>}
          <span style={{ padding: 10 }}>Página {page} de {totalPages}</span>
          {page < totalPages && <Link className="btn secondary" href={`?${query}&page=${page + 1}`}>Siguiente</Link>}
        </nav>}
      </div>
    </section>
  );
}
