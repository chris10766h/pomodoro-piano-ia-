
import { GoogleGenAI, Type } from "@google/genai";
import { PracticePlan } from "../types";

// Always use {apiKey: process.env.API_KEY} for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPracticePlan = async (userInput: string, duration: number): Promise<PracticePlan> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `El estudiante está practicando: "${userInput}". Genera un plan de práctica de EXACTAMENTE ${duration} minutos estructurado en español. 
    IMPORTANTE: Clasifica cada paso en una de estas 3 categorías: 
    - 'ESTUDIO': Para técnica, lectura lenta o análisis.
    - 'PRÁCTICA': Para tocar piezas fluidas o repertorio.
    - 'DESCANSO': Breves pausas de 2-5 min si la sesión es larga.`,
    config: {
      systemInstruction: "Eres un entrenador de piano experto. Crea planes de práctica dinámicos en ESPAÑOL. Cada paso DEBE tener un 'type' que sea estrictamente 'ESTUDIO', 'PRÁCTICA' o 'DESCANSO'.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                duration: { type: Type.STRING },
                action: { type: Type.STRING },
                description: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['ESTUDIO', 'PRÁCTICA', 'DESCANSO'] }
              },
              required: ["duration", "action", "description", "type"]
            }
          },
          techniqueTip: { type: Type.STRING }
        },
        required: ["title", "steps", "techniqueTip"]
      }
    }
  });

  // Correctly access .text property from the response and parse JSON
  const jsonStr = response.text || '{}';
  return JSON.parse(jsonStr.trim()) as PracticePlan;
};

export const getInspirationalQuote = async (): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Dame una cita corta sobre piano en español.",
    config: { systemInstruction: "Responde siempre en español." }
  });
  // Directly access the .text property for the result
  return response.text || "La práctica es el puente entre el deseo y la maestría.";
};
