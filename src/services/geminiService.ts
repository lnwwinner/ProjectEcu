import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini AI
// Note: process.env.GEMINI_API_KEY is injected by the platform
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface ECUAnalysis {
  brand: string;
  model: string;
  fileStatus: 'Original' | 'Modified';
  tuningLevel: number;
  performanceScore: number;
  summary: string;
}

/**
 * Uses Google Gemini to analyze ECU file metadata and hex samples.
 * Returns a structured JSON analysis of the ECU.
 */
export async function analyzeECUFile(filename: string, hexSample: string): Promise<ECUAnalysis> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          text: `You are an expert ECU Tuning Analyst. Analyze the following ECU binary file information:
          
          Filename: ${filename}
          Hex Sample (Partial): ${hexSample.substring(0, 4000)}
          
          Identify the ECU manufacturer (Brand), the vehicle model it belongs to, and determine if the file appears to be an Original (Stock) or Modified (Tuned) firmware.
          Provide an estimated tuning level (0-100%) and a performance efficiency score (0-100).`
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brand: { type: Type.STRING, description: "ECU Brand (e.g., Bosch, Siemens, Magneti Marelli)" },
            model: { type: Type.STRING, description: "Vehicle Model and Engine" },
            fileStatus: { type: Type.STRING, enum: ["Original", "Modified"], description: "Whether the file is stock or tuned" },
            tuningLevel: { type: Type.NUMBER, description: "Estimated tuning level percentage (0-100)" },
            performanceScore: { type: Type.NUMBER, description: "Estimated performance efficiency score (0-100)" },
            summary: { type: Type.STRING, description: "A brief technical summary of the findings" }
          },
          required: ["brand", "model", "fileStatus", "tuningLevel", "performanceScore", "summary"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response from Gemini AI");
    }

    return JSON.parse(response.text) as ECUAnalysis;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("Failed to analyze ECU file with AI.");
  }
}

export interface ImpactReport {
  hpGain: number;
  tqGain: number;
  risk: string;
  summary: string;
}

export async function generateImpactReport(
  strategy: string,
  boost: number,
  afr: number,
  timing: number
): Promise<ImpactReport> {
  try {
    // First get the basic heuristic calculation from the backend
    const res = await fetch('/api/impact-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy, boost, afr, timing })
    });
    
    if (!res.ok) throw new Error("Failed to fetch impact report");
    const data = await res.json();

    // Enhance the summary with Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As an expert ECU tuner, provide a 2-sentence impact report for these changes: Strategy: ${strategy}, Boost: ${boost} bar, AFR: ${afr}, Timing: ${timing} deg. Risk level is ${data.risk}. Mention HP/Torque gains of ~${data.hpGain}% / ~${data.tqGain}%. Focus on engine longevity and performance.`
    });

    return {
      ...data,
      summary: response.text || data.summary
    };
  } catch (error) {
    console.error("AI Impact Report Error:", error);
    throw new Error("Failed to generate impact report.");
  }
}
