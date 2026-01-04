import { StudySession, TodoItem } from "../types";

export async function getAccountabilityCoaching(
  sessions: StudySession[],
  todos: TodoItem[]
): Promise<string> {
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessions, todos }),
    });

    const data = await res.json();
    return data.text || "No response from AI";
  } catch (err) {
    return "AI coach is unavailable right now.";
  }
}
