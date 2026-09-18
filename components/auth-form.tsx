"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form);
    if (mode === "register") {
      const response = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      if (!response.ok) { setError((await response.json()).error); setLoading(false); return; }
    }
    const result = await signIn("credentials", { email: values.email, password: values.password, redirect: false });
    if (result?.error) { setError("Correo o contraseña incorrectos."); setLoading(false); return; }
    router.push("/dashboard"); router.refresh();
  }
  return (
    <form onSubmit={submit} className="card" style={{ padding: 28, display: "grid", gap: 16 }}>
      {error && <p className="flash error">{error}</p>}
      {mode === "register" && <>
        <label className="label">Nombre completo<input name="name" className="field" required minLength={2} /></label>
        <label className="label">Usuario<input name="username" className="field" required minLength={3} pattern="[a-zA-Z0-9_]+" /></label>
      </>}
      <label className="label">Correo electrónico<input type="email" name="email" className="field" required /></label>
      <label className="label">Contraseña<input type="password" name="password" className="field" required minLength={8} /></label>
      <button className="btn" disabled={loading}>{loading ? "Procesando..." : mode === "login" ? "Ingresar" : "Crear mi cuenta"}</button>
      <p className="muted" style={{ textAlign: "center", margin: 0 }}>
        {mode === "login" ? <>¿No tienes cuenta? <Link href="/register"><strong>Regístrate</strong></Link></> : <>¿Ya tienes cuenta? <Link href="/login"><strong>Ingresa</strong></Link></>}
      </p>
    </form>
  );
}
