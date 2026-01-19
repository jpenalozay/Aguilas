
import { GoogleGenAI } from "@google/genai";
import { Incident, DetectionType } from "../types";

/**
 * Genera un reporte táctico avanzado incluyendo análisis de comportamiento.
 */
export const generatePoliceReport = async (incident: Incident, retries = 2): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isPredictive = incident.type === DetectionType.SUSPICIOUS_BEHAVIOR || incident.type === DetectionType.PREDICTED_CRIME;

  const prompt = `INSTRUCCIÓN TÁCTICA DE COMANDO: Eres el oficial superior de IA de Jesús María.
SITUACIÓN: ${incident.type} detectado.
UBICACIÓN: ${incident.location}
CONTEXTO: ${isPredictive ? 'ANÁLISIS DE COMPORTAMIENTO PREDICTIVO ACTIVADO' : 'EVENTO EN CURSO'}.
CONFIANZA IA: ${(incident.confidence * 100).toFixed(0)}%.

REQUERIDO (REPORTE OPERATIVO CONCISO):
1. ANÁLISIS DE LA AMENAZA: Por qué el sistema marcó esto como ${incident.type}.
2. EVALUACIÓN DE RIESGO: Impacto en seguridad ciudadana en esa zona de Lima.
3. PROTOCOLO DE INTERVENCIÓN: Pasos tácticos inmediatos para el Serenazgo (ej. interceptación, seguimiento discreto, megafonía).

REPORTE BREVE, DIRECTO Y PROFESIONAL.`;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          temperature: 0.1,
          topP: 0.8,
        }
      });

      if (response && response.text) {
        return response.text;
      }
      
      throw new Error("Empty Response");
    } catch (error: any) {
      console.warn(`Reintento ${i + 1} fallido:`, error);
      if (i === retries - 1) {
        return `PROTOCOLO DE RESPUESTA POR DEFECTO:
Detección: ${incident.type} en ${incident.location}.
Acción: Despachar unidad QR-04 para verificación inmediata.
Estado: ALERTA ROJA.`;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  return "Falla crítica en motor de análisis Gemini.";
};
