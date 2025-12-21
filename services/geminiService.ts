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
    return "The Oracle says: Focus on your breathing and keep your core tight. You got this, warrior!";
  }

  try {
    const prompt = `
      You are a fantasy RPG wise mentor and fitness coach.
      The user is a level ${user.level} ${user.class} named ${user.username}.
      They are about to attempt the workout mission: "${workout.title}".
      Description: ${workout.description}.
      Give them a short, motivating, fantasy-themed speech (max 2 sentences) to boost their Willpower stats.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "The spirits are silent, but your strength is real.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Focus on the iron before you. The magic is within.";
  }
};

export const getTechniqueTip = async (exerciseName: string): Promise<string> => {
   if (API_KEY === 'demo-key') {
    return `Technique Analysis: Ensure full range of motion for ${exerciseName}. Control the eccentric phase.`;
  }
  
  try {
     const prompt = `Provide a single, crucial safety tip for performing the exercise: ${exerciseName}. Keep it concise and professional.`;
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Maintain proper form to avoid injury.";
  } catch (error) {
    return "Check your form in the mirror.";
  }
}