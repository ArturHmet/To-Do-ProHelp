import React from 'react';
import { Task } from '../types';
import { Check, Trash2, Calendar } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  return (
    <div 
      className={`group flex items-center justify-between p-4 mb-3 rounded-xl border transition-all duration-200 ${
        task.completed 
          ? 'bg-gray-50 border-gray-100 opacity-75' 
          : 'bg-white border-gray-100 hover:border-primary/30 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3 flex-1 overflow-hidden">
        <button
          onClick={() => onToggle(task.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-secondary border-secondary text-white'
              : 'border-gray-300 hover:border-primary text-transparent'
          }`}
        >
          <Check size={14} strokeWidth={3} />
        </button>
        
        <div className="flex flex-col overflow-hidden">
            <span 
            className={`text-sm md:text-base truncate transition-all ${
                task.completed ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'
            }`}
            >
            {task.text}
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <Calendar size={10} />
                {new Date(task.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
            </span>
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="ml-2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Delete task"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default TaskItem;