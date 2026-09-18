"use client";

import Link from "next/link";
import { BookOpen, LogOut, Plus, Search } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function Header() {
  const { data: session, status } = useSession();
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 900 }}>
          <BookOpen size={24} /><span>Repositorio para Compartir</span>
        </Link>
        <form action="/search" className="nav-search" style={{ flex: 1, maxWidth: 360, marginLeft: 24, position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: 12 }} />
          <input className="field" name="q" placeholder="Buscar prompts y guías..." style={{ paddingLeft: 36 }} />
        </form>
        <nav className="nav-links">
          <Link href="/search" className="hide-mobile">Explorar</Link>
          {session ? (
            <>
              <Link href="/posts/new" className="btn"><Plus size={16} /><span className="hide-mobile">Publicar</span></Link>
              <Link href="/dashboard" aria-label="Panel">{session.user.name?.split(" ")[0]}</Link>
              {session.user.role === "ADMIN" && <Link href="/admin">Admin</Link>}
              <button onClick={() => signOut({ callbackUrl: "/" })} aria-label="Cerrar sesión" style={{ border: 0, background: "transparent" }}><LogOut size={18} /></button>
            </>
          ) : status !== "loading" ? <Link href="/login" className="btn">Ingresar</Link> : null}
        </nav>
      </div>
    </header>
  );
}
