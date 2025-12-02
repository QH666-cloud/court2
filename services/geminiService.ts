import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LitigantData, VerdictData } from "../types";

const verdictSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A neutral, slightly humorous summary of the conflict in 1-2 sentences.",
    },
    plaintiffFaultScore: {
      type: Type.NUMBER,
      description: "Percentage of fault assigned to the first person (Plaintiff). Integer 0-100.",
    },
    defendantFaultScore: {
      type: Type.NUMBER,
      description: "Percentage of fault assigned to the second person (Defendant). Integer 0-100.",
    },
    verdictReasoning: {
      type: Type.STRING,
      description: "The judge's explanation. Adopt the persona of a wise, fair, but slightly sassy cat. Use cat puns where appropriate.",
    },
    plaintiffAdvice: {
      type: Type.STRING,
      description: "Constructive, psychological advice for the first person.",
    },
    defendantAdvice: {
      type: Type.STRING,
      description: "Constructive, psychological advice for the second person.",
    },
    reconciliationRitual: {
      type: Type.STRING,
      description: "A specific, cute, actionable task they must do together to make up (e.g., 'Hug for 60 seconds', 'Buy the other person a bubble tea').",
    },
  },
  required: [
    "summary",
    "plaintiffFaultScore",
    "defendantFaultScore",
    "verdictReasoning",
    "plaintiffAdvice",
    "defendantAdvice",
    "reconciliationRitual",
  ],
};

export const getJudgeVerdict = async (
  plaintiff: LitigantData,
  defendant: LitigantData
): Promise<VerdictData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // This specific error string triggers the UI guide in App.tsx
    throw new Error("Missing API Key");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are the Honorable Judge Meow, a wise, fair, and incredibly cute cat who presides over 'Cat Court'. 
    Two humans are having a dispute. Your job is to listen to both sides, analyze the situation with emotional intelligence, and deliver a verdict.

    Please analyze the following testimonies:

    Plaintiff (Name: ${plaintiff.name}):
    - Story: "${plaintiff.story}"
    - Grievance (Why they are sad/mad): "${plaintiff.grievance}"

    Defendant (Name: ${defendant.name}):
    - Story: "${defendant.story}"
    - Grievance (Why they are sad/mad): "${defendant.grievance}"

    Be fair. Even if one person seems more wrong, try to find the nuance. 
    Your tone should be authoritative but cute (use 'Meow', 'Purr', etc., occasionally).
    However, the advice should be genuinely helpful for their relationship.
    
    IMPORTANT: Respond in CHINESE (Simplified).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: verdictSchema,
        systemInstruction: "You are an AI Cat Judge helping couples resolve arguments. Respond in Chinese.",
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as VerdictData;
    } else {
      throw new Error("The Cat Judge was silent (No response text).");
    }
  } catch (error: any) {
    console.error("Judgement Error:", error);
    // Re-throw if it's our specific key error, otherwise generic
    if (error.message === "Missing API Key") throw error;
    throw new Error("猫猫法官正在午睡 (服务连接失败，请检查网络或 Key).");
  }
};