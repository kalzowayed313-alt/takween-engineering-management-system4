
import { GoogleGenAI, Type } from "@google/genai";
import { Task, Employee } from "../types";

// Note: Official SDK guidelines require creating a new instance before API calls for fresh context.
export const analyzePerformance = async (employee: Employee, tasks: Task[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Complex Text Task
      contents: `بناءً على بيانات الموظف ${employee.name} والمهام المنجزة، قم بتحليل أدائه واقتراح نقاط تحسين باللغة العربية. درجة الـ KPI الحالية هي ${employee.kpi}. المهام الحالية: ${tasks.map(t => t.title).join(', ')}`,
      config: {
        systemInstruction: "أنت محلل موارد بشرية خبير في شركة هندسية. قدم تحليلاً مهنياً وموجزاً ومبنياً على البيانات المتاحة.",
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Performance Analysis failed:", error);
    return "فشل في تحليل البيانات حالياً.";
  }
};

export const suggestTasks = async (projectDescription: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Complex reasoning for engineering tasks
      contents: `اقترح 5 مهام هندسية لمشروع: ${projectDescription}. أرجع النتيجة بتنسيق JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'The short title of the task.',
              },
              description: {
                type: Type.STRING,
                description: 'A detailed description of what needs to be done.',
              },
              priority: {
                type: Type.STRING,
                description: 'Task priority: HIGH, MEDIUM, or LOW',
              }
            },
            required: ["title", "description", "priority"]
          }
        }
      }
    });
    
    // As per guidelines, trim the text output before parsing.
    const jsonStr = response.text?.trim();
    return jsonStr ? JSON.parse(jsonStr) : null;
  } catch (error) {
    console.error("AI Task Suggestion failed:", error);
    return null;
  }
};
