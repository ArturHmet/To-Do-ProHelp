import { GoogleGenAI, Type } from "@google/genai";
import { Task, Goal } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

export const geminiService = {
  /**
   * Breaks down a complex goal into smaller actionable tasks.
   */
  breakDownGoal: async (goalTitle: string): Promise<{ text: string }[]> => {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Пользователь хочет достичь следующей цели: "${goalTitle}". 
        Разбей эту цель на 3-7 конкретных, выполнимых задач (ToDo list). 
        Задачи должны быть краткими и понятными.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: {
                  type: Type.STRING,
                  description: "Текст задачи",
                },
              },
              required: ["text"],
            },
          },
        },
      });

      const jsonStr = response.text || "[]";
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error breaking down goal:", error);
      throw new Error("Не удалось создать план задач. Попробуйте еще раз.");
    }
  },

  /**
   * Chat with the AI Coach.
   */
  chatWithCoach: async (
    message: string, 
    context: { goals: Goal[], tasks: Task[] },
    history: { role: 'user' | 'model'; text: string }[]
  ): Promise<string> => {
    try {
      // Prepare context summary
      const activeGoals = context.goals.filter(g => !g.completed).map(g => g.title).join(", ");
      const pendingTasks = context.tasks.filter(t => !t.completed).length;
      const completedTasks = context.tasks.filter(t => t.completed).length;
      
      const systemInstruction = `Ты — дружелюбный и мудрый ИИ-коуч по продуктивности. 
      Твоя задача — мотивировать пользователя, помогать ему разбираться с приоритетами и давать советы по достижению целей.
      
      Текущий контекст пользователя:
      - Активные цели: ${activeGoals || "нет активных целей"}
      - Задач выполнено: ${completedTasks}
      - Задач в ожидании: ${pendingTasks}
      
      Отвечай кратко, по делу, с эмпатией. Используй эмодзи, чтобы оживить диалог. 
      Если пользователь просит совета, опирайся на контекст его задач.`;

      // Convert history to format expected by Chat (if using chat history feature, but here we use single turn or manage history manually)
      // For simplicity in this structure, we will send the history as part of the prompt or use a Chat session if consistent.
      // Let's use a fresh Chat session for each interaction to keep it simple but inject history manually if needed, 
      // or better: Use `chats.create` with previous history.

      const chat = ai.chats.create({
        model: MODEL_NAME,
        config: {
          systemInstruction: systemInstruction,
        },
        history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.text }]
        }))
      });

      const result = await chat.sendMessage({ message: message });
      return result.text || "Извини, я задумался. Можешь повторить?";
    } catch (error) {
      console.error("Error in chat:", error);
      return "Упс, возникла ошибка соединения с моим 'мозгом'. Попробуй позже!";
    }
  },

  /**
   * Generate a quick motivational quote or tip based on progress.
   */
  getMotivation: async (completedCount: number): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Пользователь выполнил ${completedCount} задач сегодня. Дай очень короткую (1 предложение) мотивирующую фразу или похвалу на русском языке.`,
        });
        return response.text || "Отличная работа!";
    } catch (e) {
        return "Так держать!";
    }
  }
};