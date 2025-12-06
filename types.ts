export interface Task {
  id: string;
  text: string;
  completed: boolean;
  goalId?: string; // Links a task to a larger goal
  createdAt: number;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number; // 0-100
  createdAt: number;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TASKS = 'TASKS',
  COACH = 'COACH',
  FOCUS = 'FOCUS'
}

export interface AISuggestion {
  task: string;
  reasoning: string;
}