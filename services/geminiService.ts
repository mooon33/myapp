
import { GoogleGenAI } from "@google/genai";
import { UserProfile, WorkoutNode, Exercise } from "../types";

const API_KEY = process.env.API_KEY || 'demo-key';
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getWorkoutMotivation = async (
  user: UserProfile, 
  workout: WorkoutNode
): Promise<string> => {
  if (API_KEY === 'demo-key') return "Оракул говорит: Твоя сила растет с каждым повторением.";

  try {
    const prompt = `
      Ты мудрый наставник в RPG. Пользователь ${user.username} (Ур ${user.level} ${user.class}) начинает тренировку "${workout.title}".
      Дай мотивацию (макс 2 предложения) на русском языке.
    `;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "Сила в тебе.";
  } catch (error) {
    return "Сосредоточься на железе.";
  }
};

export const getTechniqueTip = async (exerciseName: string): Promise<string> => {
   if (API_KEY === 'demo-key') return "Держи спину ровно и контролируй дыхание.";
  
  try {
     const prompt = `Дай 1 главный совет по технике "${exerciseName}" на русском.`;
     const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "Следи за техникой.";
  } catch (error) {
    return "Контроль важнее веса.";
  }
};

// --- NEW FEATURES ---

export const generateCustomWorkout = async (
    userRequest: string,
    user: UserProfile
): Promise<WorkoutNode | null> => {
    if (API_KEY === 'demo-key') {
        // Mock response for demo
        return {
            id: `custom-${Date.now()}`,
            title: "ИИ Генерация: Фулбади",
            description: "Сбалансированная тренировка, созданная Оракулом.",
            type: 'workout',
            status: 'available',
            xpReward: 200,
            goldReward: 80,
            position: { x: 50, y: 50 },
            chapter: 99,
            exercises: [
                { id: 'cx-1', name: 'Отжимания', sets: 3, reps: 15 },
                { id: 'cx-2', name: 'Приседания', sets: 4, reps: 20 },
                { id: 'cx-3', name: 'Планка', sets: 3, reps: '45 сек' }
            ]
        };
    }

    try {
        const prompt = `
            Create a gym workout based on this request: "${userRequest}".
            User level: ${user.level}, Class: ${user.class}.
            Return ONLY valid JSON matching this interface:
            {
              "title": "string (in Russian)",
              "description": "string (in Russian)",
              "exercises": [
                { "name": "string (in Russian)", "sets": number, "reps": "string or number", "rpe": number (optional) }
              ]
            }
            Do not wrap in markdown code blocks.
        `;

        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
        const text = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();
        
        if (!text) return null;

        const data = JSON.parse(text);

        return {
            id: `custom-${Date.now()}`,
            title: data.title || "Тренировка",
            description: data.description || "Создано ИИ",
            type: 'workout',
            status: 'available',
            xpReward: 250,
            goldReward: 100,
            position: { x: 50, y: 50 },
            chapter: 99,
            exercises: data.exercises.map((ex: any, i: number) => ({
                id: `cx-${Date.now()}-${i}`,
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                rpe: ex.rpe
            }))
        };
    } catch (e) {
        console.error("AI Gen Error", e);
        return null;
    }
};

export const getExerciseSubstitutes = async (exerciseName: string): Promise<string[]> => {
    if (API_KEY === 'demo-key') return ["Альтернатива 1", "Альтернатива 2"];

    try {
        const prompt = `Suggest 3 alternative exercises for "${exerciseName}" that target the same muscles. Return only a JSON array of strings in Russian. Example: ["Упр 1", "Упр 2"]. No markdown.`;
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
        const text = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();
        return text ? JSON.parse(text) : [];
    } catch (e) {
        return [];
    }
}
