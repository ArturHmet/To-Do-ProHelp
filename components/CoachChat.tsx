import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage, Task, Goal } from '../types';
import { geminiService } from '../services/geminiService';

interface CoachChatProps {
  messages: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
  tasks: Task[];
  goals: Goal[];
}

const CoachChat: React.FC<CoachChatProps> = ({ messages, onAddMessage, tasks, goals }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    onAddMessage(userMsg);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      
      const responseText = await geminiService.chatWithCoach(
        userMsg.text,
        { tasks, goals },
        history
      );

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
      };

      onAddMessage(aiMsg);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <Bot size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">ИИ Коуч</h3>
          <p className="text-xs text-gray-500">Всегда готов помочь и поддержать</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <Bot size={48} className="mx-auto mb-3 opacity-20" />
            <p>Привет! Я твой персональный коуч.</p>
            <p className="text-sm">Спроси меня, как лучше начать день или как разбить сложную задачу.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
              }`}
            >
              <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <span className={`text-[10px] block mt-1 ${msg.role === 'user' ? 'text-primary-100' : 'text-gray-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span className="text-sm text-gray-500">Печатает...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-full border border-gray-200 px-4 py-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Напишите сообщение..."
            className="flex-1 bg-transparent focus:outline-none text-sm md:text-base"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-primary text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-primary transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachChat;