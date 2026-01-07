import { GoogleGenAI, Type } from "@google/genai";
import { VocabCard } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Model for text-based tasks
const TEXT_MODEL = "gemini-3-flash-preview";

export const generateEmailRefinement = async (draft: string, context: string): Promise<string> => {
  try {
    const prompt = `
      You are an expert Business English instructor specializing in Laboratory and Scientific contexts. The user is a Chinese speaker.
      
      Task: Rewrite and improve the following email draft.
      Context: ${context}
      Original Draft: "${draft}"
      
      Requirements:
      1. Correct all grammar and spelling errors.
      2. Adjust the tone to be professional, polite, and concise (Business English).
      3. Use appropriate terminology for a laboratory inspection/testing environment.
      4. Provide a brief explanation of the key changes made at the bottom in CHINESE (中文).
      
      Output format: Markdown.
    `;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
    });

    return response.text || "无法生成回复，请重试。";
  } catch (error) {
    console.error("Gemini Email Error:", error);
    return "生成邮件优化建议时出错，请检查网络设置。";
  }
};

export const generateReplyDraft = async (incomingEmail: string, keyPoints: string): Promise<string> => {
  try {
    const prompt = `
      You are a senior Laboratory Manager and English communication expert. The user is a lab technician who needs to reply to an email.

      **Task 1: Analysis**
      First, briefly analyze the 'Incoming Email' in CHINESE (中文). Identify the sender's tone (e.g., urgent, formal, frustrated) and the core request.

      **Task 2: Drafting**
      Draft a professional response in English based on the 'User's Key Points'.
      
      **Inputs:**
      - Incoming Email: "${incomingEmail}"
      - User's Key Points for Reply: "${keyPoints}"

      **Requirements:**
      - The reply must be professional, clear, and polite.
      - Use standard business English suitable for a lab/scientific company.
      - If the incoming email is angry/urgent, ensure the reply is de-escalating and reassuring.
      
      **Output Format (Markdown):**
      ## 邮件分析 (Analysis)
      [Analysis in Chinese]

      ## 建议回复 (Draft Reply)
      \`\`\`text
      Subject: [Suggest a subject line]
      
      [Email Body]
      \`\`\`

      ## 关键表达 (Key Expressions)
      [List 2-3 useful phrases used in the draft with Chinese explanation]
    `;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
    });

    return response.text || "无法生成回复，请重试。";
  } catch (error) {
    console.error("Gemini Reply Error:", error);
    return "生成回复时出错，请检查网络设置。";
  }
};

export const generateVocabCards = async (topic: string): Promise<VocabCard[]> => {
  try {
    const prompt = `Generate 3 advanced Business English vocabulary words or phrasal verbs specifically useful for a Laboratory Inspector or Lab Technician. 
    Topic focus: ${topic}.
    
    Return the result strictly as a JSON array of objects with the following properties:
    - term (string, English word/phrase)
    - translation (string, Chinese translation/meaning)
    - definition (string, brief English definition)
    - example (string, a sentence using the term in a lab context)
    - context (string, brief Chinese explanation of when to use this word)
    `;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              translation: { type: Type.STRING },
              definition: { type: Type.STRING },
              example: { type: Type.STRING },
              context: { type: Type.STRING },
            },
            required: ["term", "translation", "definition", "example", "context"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as VocabCard[];
  } catch (error) {
    console.error("Gemini Vocab Error:", error);
    return [];
  }
};