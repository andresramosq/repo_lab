"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { ImagePlus, Save, Trash2 } from "lucide-react";

type Initial = {
  id?: string; title?: string; summary?: string; content?: string; prompt?: string; useCase?: string;
  categoryId?: string; tags?: string[]; images?: string[]; status?: "DRAFT" | "PUBLISHED";
};

export function PostForm({ categories, initial = {} }: { categories: { id: string; name: string }[]; initial?: Initial }) {
  const router = useRouter();
  const [content, setContent] = useState(initial.content || "");
  const [images, setImages] = useState(initial.images || []);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    const data = new FormData(); data.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: data });
    const result = await response.json();
    if (!response.ok) setError(result.error); else setImages(current => [...current, result.url]);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    const payload = {
      title: data.get("title"), summary: data.get("summary"), content, prompt: data.get("prompt"),
      useCase: data.get("useCase"), categoryId: data.get("categoryId"),
      tags: String(data.get("tags")).split(",").map(x => x.trim()).filter(Boolean), images,
      status: data.get("status"),
    };
    const response = await fetch(initial.id ? `/api/posts/${initial.id}` : "/api/posts", {
      method: initial.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) { setError(result.error || "No pudimos guardar."); setBusy(false); return; }
    router.push(result.slug ? `/posts/${result.slug}` : "/dashboard"); router.refresh();
  }
  async function remove() {
    if (!initial.id || !confirm("¿Eliminar definitivamente esta publicación?")) return;
    const response = await fetch(`/api/posts/${initial.id}`, { method: "DELETE" });
    if (response.ok) { router.push("/dashboard"); router.refresh(); }
  }
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 20 }}>
      {error && <p className="flash error">{error}</p>}
      <div className="card" style={{ padding: 24, display: "grid", gap: 16 }}>
        <label className="label">Título<input className="field" name="title" defaultValue={initial.title} minLength={8} maxLength={120} required placeholder="Ej: Revisa mi CV como un reclutador senior" /></label>
        <label className="label">Resumen<textarea className="field" name="summary" defaultValue={initial.summary} minLength={20} maxLength={280} required rows={3} /></label>
        <label className="label">¿Cuándo se usa?<input className="field" name="useCase" defaultValue={initial.useCase} minLength={10} maxLength={300} required placeholder="Úsalo cuando quieras..." /></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
          <label className="label">Categoría<select className="field" name="categoryId" defaultValue={initial.categoryId} required><option value="">Selecciona</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label className="label">Etiquetas separadas por comas<input className="field" name="tags" defaultValue={initial.tags?.join(", ")} required placeholder="cv, empleo, chatgpt" /></label>
        </div>
      </div>
      <div className="card" style={{ padding: 24 }}>
        <label className="label">Prompt principal<textarea className="field" name="prompt" defaultValue={initial.prompt} required minLength={10} rows={10} placeholder="Escribe aquí el prompt listo para copiar..." /></label>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card" style={{ padding: 24 }}><label className="label">Explicación en Markdown<textarea className="field" value={content} onChange={e => setContent(e.target.value)} required minLength={30} rows={16} placeholder="## Cómo usarlo..." /></label></div>
        <div className="card markdown" style={{ padding: 24 }}><strong>Vista previa</strong>{content ? <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{content}</ReactMarkdown> : <p className="muted">Tu explicación aparecerá aquí.</p>}</div>
      </div>
      <div className="card" style={{ padding: 24 }}>
        <label className="btn secondary" style={{ width: "fit-content" }}><ImagePlus size={18} /> Subir imagen<input hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => upload(e.target.files?.[0])} /></label>
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>{images.map(url => <div key={url} style={{ position: "relative" }}><img src={url} alt="" width={130} height={90} style={{ objectFit: "cover", borderRadius: 8 }} /><button type="button" onClick={() => setImages(x => x.filter(i => i !== url))} style={{ position: "absolute", right: 4, top: 4 }}>×</button></div>)}</div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn" name="status" value="PUBLISHED" disabled={busy}><Save size={17} /> Publicar</button>
        <button className="btn secondary" name="status" value="DRAFT" disabled={busy}>Guardar borrador</button>
        {initial.id && <button type="button" className="btn danger" onClick={remove} style={{ marginLeft: "auto" }}><Trash2 size={17} /> Eliminar</button>}
      </div>
    </form>
  );
}
