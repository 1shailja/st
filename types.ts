export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  date: string; // ISO Date string YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
}

export interface StudySession {
  id: string;
  subject: string;
  durationSeconds: number;
  startTime: string; // ISO String
  date: string; // YYYY-MM-DD for grouping
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TASKS = 'TASKS',
  TIMER = 'TIMER',
  ANALYTICS = 'ANALYTICS',
  COACH = 'COACH'
}

export interface ChartDataPoint {
  name: string;
  value: number;
}
