"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Copy, Flag, ThumbsDown, ThumbsUp } from "lucide-react";

export function PostActions({ postId, prompt, initialVote, favorite }: { postId: string; prompt: string; initialVote?: string; favorite: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [comment, setComment] = useState("");
  async function act(body: object) {
    setMessage("");
    const response = await fetch(`/api/posts/${postId}/interact`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error); return; }
    setMessage("Guardado correctamente."); setComment(""); router.refresh();
  }
  return (
    <>
      <div className="prompt-box" style={{ position: "relative", marginTop: 14 }}>
        <button className="btn secondary" onClick={() => { navigator.clipboard.writeText(prompt); setMessage("Prompt copiado."); }} style={{ position: "absolute", right: 10, top: 10 }}><Copy size={15} /> Copiar</button>
        <pre style={{ whiteSpace: "pre-wrap", margin: "48px 0 0", fontFamily: "monospace" }}>{prompt}</pre>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 16 }}>
        <button className={`btn ${initialVote === "USEFUL" ? "" : "secondary"}`} onClick={() => act({ action: "vote", value: "USEFUL" })}><ThumbsUp size={16} /> Útil</button>
        <button className={`btn ${initialVote === "NOT_USEFUL" ? "" : "secondary"}`} onClick={() => act({ action: "vote", value: "NOT_USEFUL" })}><ThumbsDown size={16} /> No útil</button>
        <button className="btn secondary" onClick={() => act({ action: "favorite" })}><Bookmark size={16} fill={favorite ? "currentColor" : "none"} /> {favorite ? "Guardado" : "Guardar"}</button>
        <button className="btn secondary" onClick={() => { const reason = prompt("¿Por qué reportas esta publicación?"); if (reason) act({ action: "report", reason }); }}><Flag size={16} /> Reportar</button>
      </div>
      {message && <p className={message.includes("sesión") ? "flash error" : "flash"}>{message}</p>}
      <div className="card" style={{ padding: 20, marginTop: 25 }}>
        <h3 style={{ marginTop: 0 }}>Participa en la conversación</h3>
        <textarea className="field" value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Comparte cómo te funcionó o aporta una mejora..." />
        <button className="btn" style={{ marginTop: 10 }} disabled={comment.trim().length < 2} onClick={() => act({ action: "comment", body: comment })}>Comentar</button>
      </div>
    </>
  );
}
