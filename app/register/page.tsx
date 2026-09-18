import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return <main className="container" style={{ maxWidth: 470, padding: "65px 0" }}><h1>Únete a la comunidad</h1><p className="muted">Comparte lo que sabes y guarda lo que te sirve.</p><AuthForm mode="register" /></main>;
}
