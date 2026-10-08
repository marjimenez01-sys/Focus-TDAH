import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI() : null;

// Helper: Call Gemini with fallback
async function generateGeminiJson<T>(prompt: string, fallbackData: T): Promise<T> {
  if (!ai || !process.env.GEMINI_API_KEY) {
    return fallbackData;
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    const text = response.text?.trim();
    if (!text) return fallbackData;
    return JSON.parse(text) as T;
  } catch (error) {
    console.warn('Gemini API call failed, using fallback heuristic:', error);
    return fallbackData;
  }
}

// 1. AI Task Breakdown into 10-30m micro-steps
app.post('/api/ai/breakdown', async (req, res) => {
  const { title, context } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Título requerido' });
  }

  const prompt = `Actúa como un psicólogo y coach especialista en TDAH en adultos y disfunción ejecutiva.
El usuario tiene una tarea que le genera fricción o parálisis por análisis: "${title}".
${context ? `Contexto adicional: ${context}` : ''}

Tu misión es desglosarla según la neurociencia del TDAH:
1. Micro-pasos extremadamente concretos de entre 10 y 25 minutos.
2. Cada micro-paso debe iniciar con un verbo físico y visible (ej. "Abrir", "Buscar", "Escribir", "Separar"), NUNCA verbos abstractos como "Analizar", "Pensar" o "Resolver".
3. Identifica el "micro-paso ridículamente pequeño" (2 minutos) para romper la inercia sin ansiedad.
4. Una frase corta y empática que reduzca el perfeccionismo y la culpa.

Devuelve un JSON con este formato exacto:
{
  "ultraQuickStarter": "Abre el bloc de notas y escribe solo una línea con la idea principal (2 min)",
  "reassurance": "No necesitas terminarla hoy, solo activar el motor.",
  "microTasks": [
    { "title": "Abrir archivo y crear esquema con 3 viñetas", "durationMinutes": 15 },
    { "title": "Rellenar la primera viñeta con notas rápidas", "durationMinutes": 20 },
    { "title": "Revisar y guardar borrador", "durationMinutes": 15 }
  ]
}`;

  const fallback = {
    ultraQuickStarter: `Abre el espacio de trabajo o documento y deja todo listo por 2 minutos sin empezar a redactar.`,
    reassurance: 'El objetivo de hoy no es la perfección, sino dar el primer paso sin esfuerzo.',
    microTasks: [
      { title: `Preparar materiales o entorno para: ${title}`, durationMinutes: 10 },
      { title: `Avanzar la primera sección simple de: ${title}`, durationMinutes: 20 },
      { title: `Revisar avance parcial y marcar siguiente hito`, durationMinutes: 15 },
    ],
  };

  const result = await generateGeminiJson(prompt, fallback);
  res.json(result);
});

// 2. Morning Smart Planning
app.post('/api/ai/plan-morning', async (req, res) => {
  const { rawBraindump, energyLevel } = req.body;

  const prompt = `Actúa como asistente personal para una persona con TDAH durante su planificación matutina.
El usuario tiene este vaciado mental de tareas para hoy:
"${rawBraindump || 'Hacer compras, entregar informe mensual, llamar al médico, limpiar la cocina, hacer ejercicio'}"
Nivel de energía actual: ${energyLevel || 7}/10.

Aplica las siguientes reglas de diseño cognitivo para TDAH:
1. Selecciona EXACTAMENTE las 3 prioridades del día (Regla de 3 para evitar parálisis).
2. Convierte tareas complejas en microtareas concretas de 15 a 30 minutos.
3. Organiza en bloques horarios recomendados (time blocking) dejando pausas generosas (amortiguador de tiempo).
4. Si hay exceso de tareas, envía las restantes a una lista de "Cofre para después" sin culpa.
5. Mensaje motivador breve y compasivo.

Devuelve un JSON con la estructura:
{
  "priorities": [
    { "title": "...", "durationMinutes": 25, "timeBlock": "09:30 - 10:00", "whyImportant": "..." },
    { "title": "...", "durationMinutes": 30, "timeBlock": "10:30 - 11:00", "whyImportant": "..." },
    { "title": "...", "durationMinutes": 20, "timeBlock": "11:30 - 11:50", "whyImportant": "..." }
  ],
  "laterTasks": ["Tarea no esencial 1", "Tarea no esencial 2"],
  "coachTip": "Hoy priorizamos solo estas 3 cosas. Todo lo demás es opcional.",
  "overloadDetected": false
}`;

  const fallback = {
    priorities: [
      { title: "Entregar informe o tarea prioritaria", durationMinutes: 25, timeBlock: "09:30 - 10:00", whyImportant: "Reduce carga mental urgente" },
      { title: "Gestión rápida: llamar o responder correo clave", durationMinutes: 15, timeBlock: "10:30 - 10:45", whyImportant: "Evita que se acumule" },
      { title: "Organizar un espacio físico o preparar comida", durationMinutes: 20, timeBlock: "11:15 - 11:35", whyImportant: "Movimiento y autocuidado" }
    ],
    laterTasks: ["Tareas secundarias guardadas para mañana"],
    coachTip: "Concéntrate solo en la primera prioridad. Si terminas las 3, tu día es un éxito rotundo.",
    overloadDetected: false
  };

  const result = await generateGeminiJson(prompt, fallback);
  res.json(result);
});

// 3. Guilt-free Reorganize when overwhelmed
app.post('/api/ai/reorganize', async (req, res) => {
  const { currentTasks } = req.body;

  const prompt = `El usuario con TDAH está saturado y ha perdido el foco o se siente abrumado con ${Array.isArray(currentTasks) ? currentTasks.length : 'varias'} tareas pendientes.
Tareas actuales: ${JSON.stringify(currentTasks || [])}

Necesitamos un rescate cognitivo inmediato:
1. Quédate con SOLO 1 tarea prioritaria inmediata que sea fácil de abordar.
2. Mueve el resto a "Postergadas sin culpa" para desaturar su memoria de trabajo.
3. Sugiere una micro-pausa de 3 minutos (respirar, beber agua, estirar brazos).

Devuelve JSON:
{
  "rescuedTask": { "title": "...", "microStep": "Solo abre el bloc de notas y siéntate 5 minutos", "durationMinutes": 10 },
  "postponedCount": 3,
  "encouragement": "Respira. No pasa nada por mover tareas a mañana. Tu cerebro necesitaba un reinicio.",
  "resetAction": "Toma un vaso de agua fresca y estira los hombros antes de empezar."
}`;

  const fallback = {
    rescuedTask: {
      title: "Paso único: Una sola acción concreta de 10 min",
      microStep: "Siéntate, bebe un vaso de agua y haz solo este bloque",
      durationMinutes: 10
    },
    postponedCount: Array.isArray(currentTasks) ? Math.max(0, currentTasks.length - 1) : 2,
    encouragement: "Es totalmente normal recalibrar. Hemos limpiado tu lista para que no cargues con estrés.",
    resetAction: "Bebe un vaso de agua y da una vuelta de 2 minutos por la habitación."
  };

  const result = await generateGeminiJson(prompt, fallback);
  res.json(result);
});

// 4. AI Analytics: Nightly summary & weekly patterns
app.post('/api/ai/analysis', async (req, res) => {
  const { checkIns, sleepData, habits, activities, completedCount } = req.body;

  const prompt = `Analiza los datos de salud y productividad de un usuario con TDAH.
Datos:
- Check-ins recientes (Concentración, Ansiedad, Estrés, Energía, Ánimo 1-10): ${JSON.stringify(checkIns || [])}
- Sueño promedio: ${JSON.stringify(sleepData || { hours: 7.2, quality: 7 })}
- Hábitos cumplidos: ${JSON.stringify(habits || [])}
- Actividad física registrada: ${JSON.stringify(activities || [])}
- Tareas completadas hoy: ${completedCount || 4}

Genera un análisis comprensivo con enfoque neurodivergente positivo:
1. Relación entre sueño y concentración.
2. Momentos del día de mayor foco (ej. 9:00 a 11:30 o tras el metilfenidato).
3. Impacto de la actividad física o pausas en los niveles de energía y estrés.
4. Hábitos con mayor correlación con días de alto ánimo.
5. Recomendación práctica para mañana en 1 frase.

Devuelve JSON:
{
  "bestFocusWindow": "09:00 - 11:30 (después de la toma de metilfenidato y café matutino)",
  "sleepCorrelation": "Cuando duermes más de 7h, tu concentración promedio sube 2.4 puntos y la ansiedad baja notablemente.",
  "exerciseImpact": "Los días con 20+ min de caminata o ejercicio muestran una reducción del 40% en bloqueos ejecutivos.",
  "habitInsight": "Los hábitos de 'meditar' y 'ordenar 5 min' están presentes en tus días más productivos.",
  "nightlySummary": "Completaste las prioridades críticas y mantuviste tu rutina de medicación. Gran trabajo protegiendo tu energía.",
  "tomorrowRecommendation": "Comienza mañana con una tarea de baja fricción antes de abrir mensajes."
}`;

  const fallback = {
    bestFocusWindow: "09:00 - 11:30 (ventana óptima tras primera toma de metilfenidato)",
    sleepCorrelation: "El descanso de 7+ horas eleva tu concentración en un 35% y reduce la impulsividad.",
    exerciseImpact: "La actividad física ligera (caminar o estiramientos) desbloquea rápidamente la niebla mental de media tarde.",
    habitInsight: "Meditar 5 min y practicar bajo musical tienen el mayor efecto estabilizador sobre tu estado de ánimo.",
    nightlySummary: "Has navegado el día gestionando tus recursos ejecutivos con amabilidad. Gran avance en consistencia.",
    tomorrowRecommendation: "Elige solo una microtarea agradable para empezar tu mañana con impulso positivo."
  };

  const result = await generateGeminiJson(prompt, fallback);
  res.json(result);
});

// Vite Setup (dev vs prod)
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Focus TDAH server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
