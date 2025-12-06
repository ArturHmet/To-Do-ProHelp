import { Task, Goal, ChatMessage } from '../types';

const TASKS_KEY = 'ai-todo-tasks';
const GOALS_KEY = 'ai-todo-goals';
const CHAT_KEY = 'ai-todo-chat';

export const storageService = {
  getTasks: (): Task[] => {
    try {
      const stored = localStorage.getItem(TASKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load tasks", e);
      return [];
    }
  },

  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },

  getGoals: (): Goal[] => {
    try {
      const stored = localStorage.getItem(GOALS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load goals", e);
      return [];
    }
  },

  saveGoals: (goals: Goal[]) => {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  },

  getChatHistory: (): ChatMessage[] => {
    try {
      const stored = localStorage.getItem(CHAT_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load chat", e);
      return [];
    }
  },

  saveChatHistory: (chat: ChatMessage[]) => {
    localStorage.setItem(CHAT_KEY, JSON.stringify(chat));
  }
};