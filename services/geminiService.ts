import { GoogleGenAI } from "@google/genai";
import { UserProfile, WorkoutNode } from "../types";

// NOTE: In a real production app, ensure this is set in your environment variables.
// For this generated code, we assume the environment is set up correctly.
const API_KEY = process.env.API_KEY || 'demo-key';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getWorkoutMotivation = async (
  user: UserProfile, 
  workout: WorkoutNode
): Promise<string> => {
  if (API_KEY === 'demo-key') {
    return "Оракул говорит: Сосредоточься на дыхании и держи спину ровно. Ты справишься, воин!";
  }

  try {
    const prompt = `
      Ты мудрый наставник и тренер в фэнтези-RPG.
      Пользователь - уровень ${user.level} ${user.class} по имени ${user.username}.
      Он собирается выполнить миссию (тренировку): "${workout.title}".
      Описание: ${workout.description}.
      Дай ему короткую, мотивирующую речь в стиле фэнтези (максимум 2 предложения) на русском языке, чтобы повысить его характеристику Воли.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Духи молчат, но твоя сила реальна.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Сосредоточься на железе перед тобой. Магия внутри.";
  }
};

export const getTechniqueTip = async (exerciseName: string): Promise<string> => {
   if (API_KEY === 'demo-key') {
    return `Анализ техники: Обеспечьте полную амплитуду движения для упражнения ${exerciseName}. Контролируйте негативную фазу.`;
  }
  
  try {
     const prompt = `Дай один, самый важный совет по технике безопасности выполнения упражнения: ${exerciseName}. Будь краток и профессионален. Ответ дай на русском языке.`;
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Следи за правильной формой, чтобы избежать травм.";
  } catch (error) {
    return "Проверь свою технику перед зеркалом.";
  }
}