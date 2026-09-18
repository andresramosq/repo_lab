import { describe, expect, it } from "vitest";
import { compare, hash } from "bcryptjs";
import { postSchema, score, slugify } from "@/lib/content";

describe("autenticación", () => {
  it("verifica contraseñas hasheadas y rechaza una incorrecta", async () => {
    const passwordHash = await hash("Demo123!", 4);
    expect(await compare("Demo123!", passwordHash)).toBe(true);
    expect(await compare("incorrecta", passwordHash)).toBe(false);
  });
});

describe("publicaciones", () => {
  it("valida una publicación completa y crea un slug estable", () => {
    const result = postSchema.safeParse({
      title: "Revisa mi currículum profesional",
      summary: "Una revisión práctica con sugerencias claras y priorizadas.",
      content: "## Instrucciones\n\nAgrega el puesto y pega aquí todo tu currículum.",
      prompt: "Actúa como reclutador y revisa este currículum con rigor.",
      useCase: "Úsalo antes de enviar una nueva postulación.",
      categoryId: "category-id",
      tags: ["cv", "empleo"],
      images: [],
      status: "PUBLISHED",
    });
    expect(result.success).toBe(true);
    expect(slugify("Revisión de CV")).toBe("revision-de-cv");
  });
});

describe("votos", () => {
  it("calcula utilidad restando los votos negativos", () => {
    expect(score([{ value: "USEFUL" }, { value: "USEFUL" }, { value: "NOT_USEFUL" }])).toBe(1);
  });
});
