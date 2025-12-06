import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ListTodo, 
  MessageSquareText, 
  CheckCircle2, 
  Trophy,
  Timer
} from 'lucide-react';

import { Task, Goal, ChatMessage, AppView } from './types';
import { storageService } from './services/storageService';
import { geminiService } from './services/geminiService';

import TaskItem from './components/TaskItem';
import GoalCreator from './components/GoalCreator';
import CoachChat from './components/CoachChat';
import StatsChart from './components/StatsChart';
import PomodoroTimer from './components/PomodoroTimer';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [motivation, setMotivation] = useState<string>("");
  
  // Initial Data Load
  useEffect(() => {
    const loadedTasks = storageService.getTasks();
    const loadedGoals = storageService.getGoals();
    const loadedChat = storageService.getChatHistory();
    
    setTasks(loadedTasks);
    setGoals(loadedGoals);
    setMessages(loadedChat);

    // Initial motivation
    if (loadedTasks.some(t => t.completed)) {
        geminiService.getMotivation(loadedTasks.filter(t => t.completed).length)
            .then(setMotivation);
    }
  }, []);

  // Persistence Effects
  useEffect(() => storageService.saveTasks(tasks), [tasks]);
  useEffect(() => storageService.saveGoals(goals), [goals]);
  useEffect(() => storageService.saveChatHistory(messages), [messages]);

  // Handlers
  const handleAddGoal = (title: string, generatedTasks: Partial<Task>[]) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title,
      progress: 0,
      createdAt: Date.now(),
      completed: false
    };

    const newTasks: Task[] = generatedTasks.map((t, idx) => ({
      id: `${Date.now()}-${idx}`,
      text: t.text || "Новая задача",
      completed: false,
      goalId: newGoal.id,
      createdAt: Date.now()
    }));

    setGoals([newGoal, ...goals]);
    setTasks([...newTasks, ...tasks]);
    setView(AppView.TASKS); // Switch to tasks to see the new ones
  };

  const handleAddTask = (text: string) => {
    const newTask: Task = {
        id: Date.now().toString(),
        text,
        completed: false,
        createdAt: Date.now()
    };
    setTasks([newTask, ...tasks]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const deleteGoal = (id: string) => {
      if(confirm('Удалить цель и все связанные задачи?')) {
          setGoals(goals.filter(g => g.id !== id));
          setTasks(tasks.filter(t => t.goalId !== id));
      }
  }

  const addMessage = (msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  };

  // Views
  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Обзор</h1>
        <p className="text-gray-500">{motivation || "Готовы к новым свершениям?"}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsChart tasks={tasks} />
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <Trophy size={48} className="text-accent mb-2" />
            <div className="text-3xl font-bold text-gray-800">{goals.length}</div>
            <div className="text-sm text-gray-500">Активных целей</div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Ваши цели</h2>
        {goals.length === 0 ? (
           <div className="text-center p-8 bg-white rounded-xl border border-dashed border-gray-300">
             <p className="text-gray-400">Пока нет целей. Создайте первую!</p>
             <button 
                onClick={() => setView(AppView.TASKS)}
                className="mt-2 text-primary hover:underline"
             >
                Перейти к задачам
             </button>
           </div>
        ) : (
          <div className="grid gap-3">
            {goals.map(goal => {
                const goalTasks = tasks.filter(t => t.goalId === goal.id);
                const completedCount = goalTasks.filter(t => t.completed).length;
                const totalCount = goalTasks.length;
                const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                return (
                    <div key={goal.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                         <div className="flex justify-between items-start mb-2">
                             <h3 className="font-semibold text-gray-800">{goal.title}</h3>
                             <button onClick={() => deleteGoal(goal.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <CheckCircle2 size={16}/>
                             </button>
                         </div>
                         <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                            <div className="bg-secondary h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                         </div>
                         <div className="flex justify-between text-xs text-gray-400">
                             <span>{completedCount}/{totalCount} задач</span>
                             <span>{percent}%</span>
                         </div>
                    </div>
                );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="animate-in fade-in duration-500">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Задачи</h1>
        <p className="text-gray-500">Создавайте цели и выполняйте задачи</p>
      </header>

      <GoalCreator onAddGoal={handleAddGoal} />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
           <input 
             type="text"
             placeholder="Добавить простую задачу..."
             className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
             onKeyDown={(e) => {
                 if(e.key === 'Enter' && e.currentTarget.value.trim()){
                     handleAddTask(e.currentTarget.value);
                     e.currentTarget.value = '';
                 }
             }}
           />
      </div>

      <div className="space-y-1">
        {tasks.length === 0 && (
            <div className="text-center py-10 opacity-50">
                <ListTodo size={48} className="mx-auto mb-2" />
                <p>Список пуст</p>
            </div>
        )}
        {tasks.filter(t => !t.completed).map(task => (
          <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
        ))}
        {tasks.filter(t => t.completed).length > 0 && (
            <div className="pt-4 mt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Завершено</h3>
                {tasks.filter(t => t.completed).map(task => (
                    <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                ))}
            </div>
        )}
      </div>
    </div>
  );

  const renderCoach = () => (
      <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] animate-in fade-in duration-500 pt-2">
          <CoachChat 
            messages={messages} 
            onAddMessage={addMessage} 
            tasks={tasks}
            goals={goals}
          />
      </div>
  );

  const renderFocus = () => (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] animate-in fade-in duration-500">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Помодоро Таймер</h1>
        <p className="text-gray-500">Сфокусируйтесь на важных задачах</p>
      </header>
      <PomodoroTimer tasks={tasks} onToggleTask={toggleTask} />
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-6 shadow-sm z-10">
        <div className="flex items-center gap-2 mb-10 text-primary">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xl">Ц</div>
            <span className="text-xl font-bold tracking-tight text-gray-800">Цель<span className="text-primary">AI</span></span>
        </div>
        
        <nav className="flex-1 space-y-2">
            <button 
                onClick={() => setView(AppView.DASHBOARD)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === AppView.DASHBOARD ? 'bg-primary/10 text-primary font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                <LayoutDashboard size={20} />
                Обзор
            </button>
            <button 
                onClick={() => setView(AppView.TASKS)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === AppView.TASKS ? 'bg-primary/10 text-primary font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                <ListTodo size={20} />
                Задачи
            </button>
            <button 
                onClick={() => setView(AppView.FOCUS)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === AppView.FOCUS ? 'bg-primary/10 text-primary font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                <Timer size={20} />
                Таймер
            </button>
            <button 
                onClick={() => setView(AppView.COACH)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === AppView.COACH ? 'bg-primary/10 text-primary font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                <MessageSquareText size={20} />
                ИИ Коуч
            </button>
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="font-bold text-lg text-gray-800">Цель<span className="text-primary">AI</span></div>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
              {tasks.filter(t => !t.completed).length}
          </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto w-full">
        {view === AppView.DASHBOARD && renderDashboard()}
        {view === AppView.TASKS && renderTasks()}
        {view === AppView.FOCUS && renderFocus()}
        {view === AppView.COACH && renderCoach()}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around z-30 px-2 pb-safe">
        <button 
            onClick={() => setView(AppView.DASHBOARD)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${view === AppView.DASHBOARD ? 'text-primary' : 'text-gray-400'}`}
        >
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-medium">Обзор</span>
        </button>
        <button 
            onClick={() => setView(AppView.TASKS)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${view === AppView.TASKS ? 'text-primary' : 'text-gray-400'}`}
        >
            <ListTodo size={20} />
            <span className="text-[10px] font-medium">Задачи</span>
        </button>
        <button 
            onClick={() => setView(AppView.FOCUS)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${view === AppView.FOCUS ? 'text-primary' : 'text-gray-400'}`}
        >
            <Timer size={20} />
            <span className="text-[10px] font-medium">Таймер</span>
        </button>
        <button 
            onClick={() => setView(AppView.COACH)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${view === AppView.COACH ? 'text-primary' : 'text-gray-400'}`}
        >
            <MessageSquareText size={20} />
            <span className="text-[10px] font-medium">Коуч</span>
        </button>
      </nav>
    </div>
  );
}

export default App;