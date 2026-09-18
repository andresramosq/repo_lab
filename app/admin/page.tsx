import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminAction } from "@/components/admin-actions";

export default async function AdminPage() {
  const session = await getAuth();
  if (session?.user.role !== "ADMIN") redirect("/");
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const [users, posts, votesToday, reports] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    db.post.count(),
    db.vote.count({ where: { createdAt: { gte: start } } }),
    db.report.findMany({ where: { status: "OPEN" }, include: { user: true, post: true }, orderBy: { createdAt: "desc" } }),
  ]);
  return (
    <main className="container section">
      <h1>Administración</h1>
      <div className="summary-grid">
        {[["Usuarios", users.length], ["Publicaciones", posts], ["Votos hoy", votesToday]].map(([k, v]) => <div className="card" style={{ padding: 20 }} key={k}><span className="muted">{k}</span><div style={{ fontSize: 32, fontWeight: 900 }}>{v}</div></div>)}
      </div>
      <h2 style={{ marginTop: 40 }}>Reportes abiertos</h2>
      {reports.length ? reports.map(report => <div className="card" key={report.id} style={{ padding: 18, marginBottom: 10 }}><strong>{report.post.title}</strong><p>{report.reason}</p><p className="muted">Reportado por @{report.user.username}</p><div style={{ display: "flex", gap: 8 }}><AdminAction body={{ action: "resolve", reportId: report.id }}>Resolver</AdminAction><AdminAction danger body={{ action: "deletePost", postId: report.postId }}>Eliminar publicación</AdminAction></div></div>) : <p className="muted">No hay reportes pendientes.</p>}
      <h2 style={{ marginTop: 40 }}>Usuarios</h2>
      <div className="card" style={{ overflow: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><tbody>{users.map(user => <tr key={user.id} style={{ borderBottom: "1px solid var(--line)" }}><td style={{ padding: 14 }}><strong>{user.name}</strong><br /><span className="muted">@{user.username} · {user.email}</span></td><td>{user.role}</td><td style={{ padding: 14, textAlign: "right" }}>{user.id !== session.user.id && <AdminAction danger={!user.banned} body={{ action: "ban", userId: user.id, banned: !user.banned }}>{user.banned ? "Desbloquear" : "Bloquear"}</AdminAction>}</td></tr>)}</tbody></table></div>
    </main>
  );
}
