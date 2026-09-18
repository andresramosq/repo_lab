import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: { default: "Repositorio para Compartir", template: "%s | Repositorio para Compartir" },
  description: "Comunidad para compartir prompts, guías y conocimiento práctico de inteligencia artificial.",
  openGraph: { title: "Repositorio para Compartir", description: "Aprende y comparte conocimiento práctico de IA.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <Providers><Header />{children}</Providers>
        <footer style={{ borderTop: "1px solid var(--line)", padding: "34px 0", marginTop: 50 }}>
          <div className="container" style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <strong>Repositorio para Compartir</strong>
            <span className="muted">Conocimiento de IA, creado por la comunidad.</span>
            <Link href="/search">Explorar publicaciones</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
