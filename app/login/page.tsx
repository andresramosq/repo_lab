import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return <main className="container" style={{ maxWidth: 470, padding: "65px 0" }}><h1>Bienvenido de nuevo</h1><p className="muted">Ingresa a Repositorio para Compartir.</p><AuthForm mode="login" /></main>;
}
