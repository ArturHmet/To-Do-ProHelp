import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Armchair, CheckCircle2 } from 'lucide-react';
import { Task } from '../types';

interface PomodoroTimerProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
}

type TimerMode = 'focus' | 'short' | 'long';

const MODES: Record<TimerMode, { label: string; minutes: number; color: string; icon: React.ElementType }> = {
  focus: { label: 'Фокус', minutes: 25, color: 'text-primary', icon: Brain },
  short: { label: 'Короткий перерыв', minutes: 5, color: 'text-secondary', icon: Coffee },
  long: { label: 'Длинный перерыв', minutes: 15, color: 'text-accent', icon: Armchair },
};

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ tasks, onToggleTask }) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const activeTasks = tasks.filter(t => !t.completed);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Notify user
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Таймер завершен!", {
          body: mode === 'focus' ? "Время отдохнуть!" : "Пора возвращаться к работе!",
        });
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].minutes * 60);
  };

  const changeMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(MODES[newMode].minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((MODES[mode].minutes * 60 - timeLeft) / (MODES[mode].minutes * 60)) * 100;
  const ModeIcon = MODES[mode].icon;

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      {/* Timer Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gray-100`}>
             <div 
                className={`h-full transition-all duration-1000 ease-linear ${mode === 'focus' ? 'bg-primary' : mode === 'short' ? 'bg-secondary' : 'bg-accent'}`} 
                style={{ width: `${progress}%` }}
             />
        </div>

        <div className="flex gap-2 mb-8 bg-gray-50 p-1 rounded-xl">
          {(Object.keys(MODES) as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => changeMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m 
                  ? 'bg-white text-gray-800 shadow-sm ring-1 ring-gray-200' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        <div className="relative mb-8">
            <div className={`text-8xl font-bold tracking-tighter tabular-nums ${MODES[mode].color} transition-colors duration-500`}>
              {formatTime(timeLeft)}
            </div>
            <div className="flex justify-center mt-2 text-gray-400 items-center gap-2">
                <ModeIcon size={18} />
                <span className="uppercase tracking-widest text-xs font-semibold">{isActive ? 'Идет таймер' : 'Пауза'}</span>
            </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-lg hover:scale-105 active:scale-95 ${
              isActive ? 'bg-gray-800' : 'bg-primary'
            }`}
          >
            {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          <button
            onClick={resetTimer}
            className="w-16 h-16 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-all"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>

      {/* Task Selection Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Brain size={20} className="text-primary" />
          На чем фокусируемся?
        </h3>
        
        {activeTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Нет активных задач. Добавьте задачи во вкладке "Задачи", чтобы начать работу над ними.
          </div>
        ) : (
          <div className="space-y-2">
            {activeTasks.map(task => (
              <div 
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                  selectedTaskId === task.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedTaskId === task.id ? 'border-primary' : 'border-gray-300'
                  }`}>
                      {selectedTaskId === task.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <span className={`${selectedTaskId === task.id ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                    {task.text}
                  </span>
                </div>
                
                {selectedTaskId === task.id && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleTask(task.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition-all"
                        title="Отметить как выполненное"
                    >
                        <CheckCircle2 size={18} />
                    </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;