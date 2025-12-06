import React, { useState } from 'react';
import { Sparkles, Plus, Loader2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Task } from '../types';

interface GoalCreatorProps {
  onAddGoal: (title: string, tasks: Partial<Task>[]) => void;
}

const GoalCreator: React.FC<GoalCreatorProps> = ({ onAddGoal }) => {
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSmartCreate = async () => {
    if (!goal.trim()) return;
    
    setIsGenerating(true);
    try {
      const generatedTasks = await geminiService.breakDownGoal(goal);
      // Map AI response to partial task objects
      const tasks: Partial<Task>[] = generatedTasks.map(t => ({
        text: t.text,
        completed: false,
        createdAt: Date.now()
      }));
      
      onAddGoal(goal, tasks);
      setGoal('');
      setIsExpanded(false);
    } catch (error) {
      alert("Не удалось сгенерировать план. Попробуйте еще раз.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSimpleCreate = () => {
      if (!goal.trim()) return;
      onAddGoal(goal, []);
      setGoal('');
      setIsExpanded(false);
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 transition-all">
      {!isExpanded ? (
        <button 
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center gap-3 text-gray-500 hover:text-primary transition-colors p-2"
        >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Plus size={24} />
            </div>
            <span className="font-medium text-lg">Новая цель...</span>
        </button>
      ) : (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Чего вы хотите достичь?
            </label>
            <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Например: Выучить испанский язык за 3 месяца"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all mb-4"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isGenerating) handleSimpleCreate();
                }}
                disabled={isGenerating}
            />
            
            <div className="flex gap-3">
                <button
                    onClick={handleSmartCreate}
                    disabled={isGenerating || !goal.trim()}
                    className="flex-1 bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Думаю...
                        </>
                    ) : (
                        <>
                            <Sparkles size={18} />
                            Создать с ИИ-планом
                        </>
                    )}
                </button>
                <button
                    onClick={handleSimpleCreate}
                    disabled={isGenerating || !goal.trim()}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                    Просто добавить
                </button>
            </div>
            <button 
                onClick={() => setIsExpanded(false)}
                className="mt-3 text-sm text-gray-400 hover:text-gray-600 w-full text-center"
            >
                Отмена
            </button>
        </div>
      )}
    </div>
  );
};

export default GoalCreator;