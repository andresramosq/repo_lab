import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const categories = [
  ["Empleo", "empleo", "CV, entrevistas y crecimiento profesional"],
  ["Investigación", "investigacion", "Métodos para buscar, contrastar y comprender"],
  ["Código", "codigo", "Desarrollo, depuración y arquitectura"],
  ["Marketing", "marketing", "Contenido, estrategia y comunicación"],
  ["Educación", "educacion", "Aprendizaje y enseñanza"],
  ["Productividad", "productividad", "Organización y trabajo más inteligente"],
  ["Creatividad", "creatividad", "Ideas, arte y procesos creativos"],
  ["Otro", "otro", "Conocimiento útil de otras áreas"],
] as const;

const samples = [
  ["Revisa mi CV como reclutador senior de tecnología","Obtén una revisión concreta de tu CV, con problemas priorizados y mejoras aplicables.","Pega tu CV cuando quieras postular a un puesto y necesites detectar debilidades.","Empleo",["cv","empleo","reclutamiento"]],
  ["Simula una entrevista técnica de JavaScript","Practica una entrevista adaptativa con preguntas, pistas y evaluación final.","Úsalo para prepararte antes de una entrevista frontend o full stack.","Empleo",["entrevista","javascript","empleo"]],
  ["Investiga un tema en 30 minutos con fuentes","Crea un plan de investigación rápido que separa hechos, hipótesis y dudas.","Úsalo cuando necesitas comprender un tema nuevo sin perder rigor.","Investigación",["investigacion","fuentes","aprendizaje"]],
  ["Genera ideas de negocio con IA","Encuentra oportunidades basadas en problemas reales y valida sus supuestos.","Úsalo al explorar un mercado o buscar un proyecto pequeño viable.","Creatividad",["negocios","ideas","validacion"]],
  ["Resume artículos académicos complejos","Convierte un paper en una explicación clara sin perder resultados ni límites.","Úsalo para estudiar literatura científica con mayor rapidez.","Educación",["papers","resumen","ciencia"]],
  ["Depura un error sin inventar soluciones","Guía al modelo para aislar causas y proponer pruebas antes de modificar código.","Úsalo cuando tienes un error reproducible y logs disponibles.","Código",["debugging","codigo","calidad"]],
  ["Diseña un plan de aprendizaje personalizado","Construye una ruta práctica según tu nivel, objetivo y tiempo disponible.","Úsalo al comenzar una habilidad o retomar estudios.","Educación",["aprendizaje","plan","estudio"]],
  ["Mejora tu perfil de LinkedIn para conseguir entrevistas","Analiza titular, extracto y experiencia con foco en búsquedas de reclutadores.","Úsalo al buscar empleo o cambiar de área profesional.","Empleo",["linkedin","empleo","marca-personal"]],
  ["Convierte una reunión en acciones claras","Extrae decisiones, responsables, fechas y preguntas pendientes de una transcripción.","Úsalo después de reuniones extensas o con muchos participantes.","Productividad",["reuniones","acciones","resumen"]],
  ["Crea una estrategia de contenido mensual","Define pilares, formatos y calendario ligados a un objetivo medible.","Úsalo para organizar contenido de una marca o proyecto.","Marketing",["contenido","marketing","calendario"]],
  ["Compara herramientas con criterios objetivos","Genera una matriz de decisión ponderada y explicita la incertidumbre.","Úsalo antes de comprar o adoptar una herramienta.","Investigación",["comparacion","decision","herramientas"]],
  ["Escribe pruebas para código existente","Identifica comportamiento, bordes y riesgos antes de generar pruebas mantenibles.","Úsalo al mejorar cobertura de una función o módulo ya implementado.","Código",["testing","codigo","calidad"]],
  ["Transforma una idea vaga en un brief creativo","Aclara audiencia, objetivo, restricciones, tono y criterios de éxito.","Úsalo antes de diseñar, escribir o producir una pieza creativa.","Creatividad",["brief","diseño","ideas"]],
  ["Prioriza tu semana según impacto y energía","Organiza tareas por valor, urgencia, esfuerzo y nivel de concentración.","Úsalo al comenzar la semana con demasiadas tareas abiertas.","Productividad",["priorizacion","planificacion","trabajo"]],
  ["Explica un concepto con ejemplos progresivos","Enseña desde una analogía simple hasta una aplicación técnica verificable.","Úsalo cuando un concepto se siente demasiado abstracto.","Educación",["explicacion","aprendizaje","ejemplos"]],
] as const;

async function main() {
  await db.report.deleteMany(); await db.comment.deleteMany(); await db.favorite.deleteMany(); await db.vote.deleteMany();
  await db.postTag.deleteMany(); await db.image.deleteMany(); await db.post.deleteMany(); await db.tag.deleteMany(); await db.category.deleteMany(); await db.user.deleteMany();
  const categoryMap = new Map<string, string>();
  for (const [name, slug, description] of categories) {
    const category = await db.category.create({ data: { name, slug, description } }); categoryMap.set(name, category.id);
  }
  const users = await Promise.all([
    db.user.create({ data: { name: "Administradora", username: "admin", email: "admin@repositorio.local", passwordHash: await hash("Admin123!", 12), role: "ADMIN", bio: "Cuido que la comunidad sea útil y segura." } }),
    db.user.create({ data: { name: "Juanito Pérez", username: "juanito", email: "juanito@demo.local", passwordHash: await hash("Demo123!", 12), bio: "Aprendiendo a usar IA para avanzar profesionalmente." } }),
    db.user.create({ data: { name: "María López", username: "maria", email: "maria@demo.local", passwordHash: await hash("Demo123!", 12), bio: "Comparto métodos de investigación y aprendizaje." } }),
  ]);
  for (let i = 0; i < samples.length; i++) {
    const [title, summary, useCase, category, tags] = samples[i];
    const post = await db.post.create({
      data: {
        title, slug: title.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),
        summary, useCase, categoryId: categoryMap.get(category)!, authorId: users[i % 3].id, status: "PUBLISHED", views: 24 + i * 17,
        prompt: `Actúa como especialista en ${category.toLowerCase()}.\n\nObjetivo: ${title}.\nContexto: [describe aquí tu situación]\n\nTrabaja paso a paso. Haz primero las preguntas necesarias. Después entrega recomendaciones concretas, priorizadas y justificadas. No inventes datos; indica cualquier incertidumbre y termina con tres acciones que pueda realizar hoy.`,
        content: `## Cómo usar este recurso\n\nCompleta el contexto entre corchetes con información real. Cuanto más específico seas, mejor será el resultado.\n\n## Qué recibirás\n\n- Un análisis adaptado a tu objetivo.\n- Recomendaciones ordenadas por impacto.\n- Preguntas para detectar información faltante.\n- Próximos pasos accionables.\n\n## Consejo\n\nRevisa siempre la respuesta y confirma cualquier dato importante con una fuente confiable.`,
        tags: { create: tags.map(name => ({ tag: { connectOrCreate: { where: { slug: name }, create: { name, slug: name } } } })) },
      },
    });
    await db.vote.createMany({ data: users.slice(0, (i % 3) + 1).map(user => ({ userId: user.id, postId: post.id, value: "USEFUL" })) });
    if (i < 6) await db.comment.create({ data: { userId: users[(i + 1) % 3].id, postId: post.id, body: "Lo probé y me ayudó a convertir una idea general en acciones concretas. Gracias por compartirlo." } });
  }
  console.log("Seed completado: 3 usuarios y 15 publicaciones.");
}

main().finally(() => db.$disconnect());
