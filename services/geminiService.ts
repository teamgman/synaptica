import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ConceptDataPayload {
    description: string;
    subconcepts: string[];
}

const conceptDataSchema = {
  type: Type.OBJECT,
  properties: {
    description: {
      type: Type.STRING,
      description: "A concise, one-sentence description of the main concept provided."
    },
    subconcepts: {
      type: Type.ARRAY,
      description: "A list of 5 to 7 primary sub-concept names.",
      items: {
        type: Type.STRING,
        description: "The name of the sub-concept.",
      },
    },
  },
  required: ["description", "subconcepts"],
};

export async function generateConceptData(concept: string): Promise<ConceptDataPayload> {
  try {
    const prompt = `For the mathematical concept "${concept}", provide a concise, one-sentence description. Then, generate a list of 5 to 7 of its primary sub-concept names.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: conceptDataSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    if (parsed && parsed.description && Array.isArray(parsed.subconcepts) && parsed.subconcepts.every(item => typeof item === 'string')) {
        return parsed;
    }
    
    throw new Error("Received an unexpected data structure from the API.");

  } catch (error) {
    console.error("Error generating concept data:", error);
    throw new Error("Failed to generate concept data. Please check the console for more details.");
  }
}

export async function generateProof(concept: string): Promise<string> {
    try {
        const prompt = `For the concept "${concept}", provide a simple, high-level, and intuitive explanation. The goal is a visually appealing summary, not a rigorous mathematical proof. Keep it concise (2-3 short paragraphs). Include at least one key formula using KaTeX-compatible LaTeX (e.g., $...$ for inline and $$...$$ for display). Format the entire output in Markdown.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                temperature: 0.1,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating proof:", error);
        throw new Error("Failed to generate proof. Please try again.");
    }
}