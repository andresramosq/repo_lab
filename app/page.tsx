import Link from "next/link";
import { ArrowRight, Search, Sparkles, Users } from "lucide-react";
import { Explorer } from "@/components/explorer";
import { db } from "@/lib/db";

export default async function Home() {
  const [posts, users] = await Promise.all([db.post.count({ where: { status: "PUBLISHED" } }), db.user.count()]);
  return (
    <main>
      <section className="hero">
        <div className="container">
          <span className="tag"><Sparkles size={13} /> Conocimiento abierto sobre IA</span>
          <h1>Aprende algo útil. Compártelo con todos.</h1>
          <p className="muted" style={{ fontSize: 19, maxWidth: 650, lineHeight: 1.6 }}>Encuentra prompts, guías y métodos probados para trabajar, investigar, crear y aprender mejor con inteligencia artificial.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 25 }}>
            <Link href="/search" className="btn"><Search size={17} /> Explorar recursos</Link>
            <Link href="/posts/new" className="btn secondary">Compartir conocimiento <ArrowRight size={17} /></Link>
          </div>
          <div style={{ display: "flex", gap: 25, marginTop: 34 }}><span><strong>{posts}</strong> publicaciones</span><span><Users size={16} style={{ display: "inline" }} /> <strong>{users}</strong> personas</span></div>
        </div>
      </section>
      <Explorer title="Lo más relevante ahora" />
    </main>
  );
}
