import { GoogleGenAI } from "@google/genai";
import { StudySession, TodoItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAccountabilityCoaching = async (
  sessions: StudySession[], 
  todos: TodoItem[]
): Promise<string> => {
  try {
    // FIX: Use local date
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    const today = (new Date(d.getTime() - offset)).toISOString().slice(0, 10);

    const recentSessions = sessions.slice(-10); // Last 10 sessions
    const pendingTodos = todos.filter(t => !t.completed && t.date <= today).length;
    const completedTodos = todos.filter(t => t.completed && t.date === today).length;

    const prompt = `
      You are a strict but encouraging study accountability partner.
      Here is the user's recent data:
      - Pending Tasks due today or overdue: ${pendingTodos}
      - Tasks completed today: ${completedTodos}
      - Recent Study Sessions: ${JSON.stringify(recentSessions.map(s => ({ subject: s.subject, minutes: Math.floor(s.durationSeconds / 60) })))}
      
      Analyze this data. 
      1. If they have studied well, congratulate them but remind them consistency is key.
      2. If they have pending tasks or low study time, give them a "tough love" motivation to start right now.
      3. Keep the response under 100 words.
      4. Do not use markdown formatting like bolding, just plain text or simple bullet points.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Keep pushing! You got this.";
  } catch (error) {
    console.error("Error getting AI coaching:", error);
    return "I'm having trouble connecting to your accountability network right now. Just focus on your next task!";
  }
};