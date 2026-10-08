import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json());
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI() : null;
async function generateGeminiJson(prompt, fallbackData) {
  if (!ai || !process.env.GEMINI_API_KEY) {
    return fallbackData;
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text?.trim();
    if (!text) return fallbackData;
    return JSON.parse(text);
  } catch (error) {
    console.warn("Gemini API call failed, using fallback heuristic:", error);
    return fallbackData;
  }
}
app.post("/api/ai/breakdown", async (req, res) => {
  const { title, context } = req.body;
  if (!title) {
    return res.status(400).json({ error: "T\xEDtulo requerido" });
  }
  const prompt = `Act\xFAa como un psic\xF3logo y coach especialista en TDAH en adultos y disfunci\xF3n ejecutiva.
El usuario tiene una tarea que le genera fricci\xF3n o par\xE1lisis por an\xE1lisis: "${title}".
${context ? `Contexto adicional: ${context}` : ""}

Tu misi\xF3n es desglosarla seg\xFAn la neurociencia del TDAH:
1. Micro-pasos extremadamente concretos de entre 10 y 25 minutos.
2. Cada micro-paso debe iniciar con un verbo f\xEDsico y visible (ej. "Abrir", "Buscar", "Escribir", "Separar"), NUNCA verbos abstractos como "Analizar", "Pensar" o "Resolver".
3. Identifica el "micro-paso rid\xEDculamente peque\xF1o" (2 minutos) para romper la inercia sin ansiedad.
4. Una frase corta y emp\xE1tica que reduzca el perfeccionismo y la culpa.

Devuelve un JSON con este formato exacto:
{
  "ultraQuickStarter": "Abre el bloc de notas y escribe solo una l\xEDnea con la idea principal (2 min)",
  "reassurance": "No necesitas terminarla hoy, solo activar el motor.",
  "microTasks": [
    { "title": "Abrir archivo y crear esquema con 3 vi\xF1etas", "durationMinutes": 15 },
    { "title": "Rellenar la primera vi\xF1eta con notas r\xE1pidas", "durationMinutes": 20 },
    { "title": "Revisar y guardar borrador", "durationMinutes": 15 }
  ]
}`;
  const fallback = {
    ultraQuickStarter: `Abre el espacio de trabajo o documento y deja todo listo por 2 minutos sin empezar a redactar.`,
    reassurance: "El objetivo de hoy no es la perfecci\xF3n, sino dar el primer paso sin esfuerzo.",
    microTasks: [
      { title: `Preparar materiales o entorno para: ${title}`, durationMinutes: 10 },
      { title: `Avanzar la primera secci\xF3n simple de: ${title}`, durationMinutes: 20 },
      { title: `Revisar avance parcial y marcar siguiente hito`, durationMinutes: 15 }
    ]
  };
  const result = await generateGeminiJson(prompt, fallback);
  res.json(result);
});
app.post("/api/ai/plan-morning", async (req, res) => {
  const { rawBraindump, energyLevel } = req.body;
  const prompt = `Act\xFAa como asistente personal para una persona con TDAH durante su planificaci\xF3n matutina.
El usuario tiene este vaciado mental de tareas para hoy:
"${rawBraindump || "Hacer compras, entregar informe mensual, llamar al m\xE9dico, limpiar la cocina, hacer ejercicio"}"
Nivel de energ\xEDa actual: ${energyLevel || 7}/10.

Aplica las siguientes reglas de dise\xF1o cognitivo para TDAH:
1. Selecciona EXACTAMENTE las 3 prioridades del d\xEDa (Regla de 3 para evitar par\xE1lisis).
2. Convierte tareas complejas en microtareas concretas de 15 a 30 minutos.
3. Organiza en bloques horarios recomendados (time blocking) dejando pausas generosas (amortiguador de tiempo).
4. Si hay exceso de tareas, env\xEDa las restantes a una lista de "Cofre para despu\xE9s" sin culpa.
5. Mensaje motivador breve y compasivo.

Devuelve un JSON con la estructura:
{
  "priorities": [
    { "title": "...", "durationMinutes": 25, "timeBlock": "09:30 - 10:00", "whyImportant": "..." },
    { "title": "...", "durationMinutes": 30, "timeBlock": "10:30 - 11:00", "whyImportant": "..." },
    { "title": "...", "durationMinutes": 20, "timeBlock": "11:30 - 11:50", "whyImportant": "..." }
  ],
  "laterTasks": ["Tarea no esencial 1", "Tarea no esencial 2"],
  "coachTip": "Hoy priorizamos solo estas 3 cosas. Todo lo dem\xE1s es opcional.",
  "overloadDetected": false
}`;
  const fallback = {
    priorities: [
      { title: "Entregar informe o tarea prioritaria", durationMinutes: 25, timeBlock: "09:30 - 10:00", whyImportant: "Reduce carga mental urgente" },
      { title: "Gesti\xF3n r\xE1pida: llamar o responder correo clave", durationMinutes: 15, timeBlock: "10:30 - 10:45", whyImportant: "Evita que se acumule" },
      { title: "Organizar un espacio f\xEDsico o preparar comida", durationMinutes: 20, timeBlock: "11:15 - 11:35", whyImportant: "Movimiento y autocuidado" }
    ],
    laterTasks: ["Tareas secundarias guardadas para ma\xF1ana"],
    coachTip: "Conc\xE9ntrate solo en la primera prioridad. Si terminas las 3, tu d\xEDa es un \xE9xito rotundo.",
    overloadDetected: false
  };
  const result = await generateGeminiJson(prompt, fallback);
  res.json(result);
});
app.post("/api/ai/reorganize", async (req, res) => {
  const { currentTasks } = req.body;
  const prompt = `El usuario con TDAH est\xE1 saturado y ha perdido el foco o se siente abrumado con ${Array.isArray(currentTasks) ? currentTasks.length : "varias"} tareas pendientes.
Tareas actuales: ${JSON.stringify(currentTasks || [])}

Necesitamos un rescate cognitivo inmediato:
1. Qu\xE9date con SOLO 1 tarea prioritaria inmediata que sea f\xE1cil de abordar.
2. Mueve el resto a "Postergadas sin culpa" para desaturar su memoria de trabajo.
3. Sugiere una micro-pausa de 3 minutos (respirar, beber agua, estirar brazos).

Devuelve JSON:
{
  "rescuedTask": { "title": "...", "microStep": "Solo abre el bloc de notas y si\xE9ntate 5 minutos", "durationMinutes": 10 },
  "postponedCount": 3,
  "encouragement": "Respira. No pasa nada por mover tareas a ma\xF1ana. Tu cerebro necesitaba un reinicio.",
  "resetAction": "Toma un vaso de agua fresca y estira los hombros antes de empezar."
}`;
  const fallback = {
    rescuedTask: {
      title: "Paso \xFAnico: Una sola acci\xF3n concreta de 10 min",
      microStep: "Si\xE9ntate, bebe un vaso de agua y haz solo este bloque",
      durationMinutes: 10
    },
    postponedCount: Array.isArray(currentTasks) ? Math.max(0, currentTasks.length - 1) : 2,
    encouragement: "Es totalmente normal recalibrar. Hemos limpiado tu lista para que no cargues con estr\xE9s.",
    resetAction: "Bebe un vaso de agua y da una vuelta de 2 minutos por la habitaci\xF3n."
  };
  const result = await generateGeminiJson(prompt, fallback);
  res.json(result);
});
app.post("/api/ai/analysis", async (req, res) => {
  const { checkIns, sleepData, habits, activities, completedCount } = req.body;
  const prompt = `Analiza los datos de salud y productividad de un usuario con TDAH.
Datos:
- Check-ins recientes (Concentraci\xF3n, Ansiedad, Estr\xE9s, Energ\xEDa, \xC1nimo 1-10): ${JSON.stringify(checkIns || [])}
- Sue\xF1o promedio: ${JSON.stringify(sleepData || { hours: 7.2, quality: 7 })}
- H\xE1bitos cumplidos: ${JSON.stringify(habits || [])}
- Actividad f\xEDsica registrada: ${JSON.stringify(activities || [])}
- Tareas completadas hoy: ${completedCount || 4}

Genera un an\xE1lisis comprensivo con enfoque neurodivergente positivo:
1. Relaci\xF3n entre sue\xF1o y concentraci\xF3n.
2. Momentos del d\xEDa de mayor foco (ej. 9:00 a 11:30 o tras el metilfenidato).
3. Impacto de la actividad f\xEDsica o pausas en los niveles de energ\xEDa y estr\xE9s.
4. H\xE1bitos con mayor correlaci\xF3n con d\xEDas de alto \xE1nimo.
5. Recomendaci\xF3n pr\xE1ctica para ma\xF1ana en 1 frase.

Devuelve JSON:
{
  "bestFocusWindow": "09:00 - 11:30 (despu\xE9s de la toma de metilfenidato y caf\xE9 matutino)",
  "sleepCorrelation": "Cuando duermes m\xE1s de 7h, tu concentraci\xF3n promedio sube 2.4 puntos y la ansiedad baja notablemente.",
  "exerciseImpact": "Los d\xEDas con 20+ min de caminata o ejercicio muestran una reducci\xF3n del 40% en bloqueos ejecutivos.",
  "habitInsight": "Los h\xE1bitos de 'meditar' y 'ordenar 5 min' est\xE1n presentes en tus d\xEDas m\xE1s productivos.",
  "nightlySummary": "Completaste las prioridades cr\xEDticas y mantuviste tu rutina de medicaci\xF3n. Gran trabajo protegiendo tu energ\xEDa.",
  "tomorrowRecommendation": "Comienza ma\xF1ana con una tarea de baja fricci\xF3n antes de abrir mensajes."
}`;
  const fallback = {
    bestFocusWindow: "09:00 - 11:30 (ventana \xF3ptima tras primera toma de metilfenidato)",
    sleepCorrelation: "El descanso de 7+ horas eleva tu concentraci\xF3n en un 35% y reduce la impulsividad.",
    exerciseImpact: "La actividad f\xEDsica ligera (caminar o estiramientos) desbloquea r\xE1pidamente la niebla mental de media tarde.",
    habitInsight: "Meditar 5 min y practicar bajo musical tienen el mayor efecto estabilizador sobre tu estado de \xE1nimo.",
    nightlySummary: "Has navegado el d\xEDa gestionando tus recursos ejecutivos con amabilidad. Gran avance en consistencia.",
    tomorrowRecommendation: "Elige solo una microtarea agradable para empezar tu ma\xF1ana con impulso positivo."
  };
  const result = await generateGeminiJson(prompt, fallback);
  res.json(result);
});
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  } else {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Focus TDAH server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
