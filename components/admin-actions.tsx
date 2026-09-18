"use client";

import { useRouter } from "next/navigation";

export function AdminAction({ body, children, danger = false }: { body: object; children: React.ReactNode; danger?: boolean }) {
  const router = useRouter();
  return <button className={`btn ${danger ? "danger" : "secondary"}`} onClick={async () => {
    if (danger && !confirm("¿Confirmas esta acción?")) return;
    const response = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (response.ok) router.refresh(); else alert((await response.json()).error);
  }}>{children}</button>;
}
