import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Task } from '../types';

interface StatsChartProps {
  tasks: Task[];
}

const COLORS = ['#10B981', '#E5E7EB']; // Emerald-500, Gray-200

const StatsChart: React.FC<StatsChartProps> = ({ tasks }) => {
  const completed = tasks.filter(t => t.completed).length;
  const active = tasks.length - completed;
  
  const data = [
    { name: 'Выполнено', value: completed },
    { name: 'В процессе', value: active },
  ];

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p className="text-gray-400 text-sm">Нет задач для статистики</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-700 mb-2 w-full text-left">Прогресс</h3>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-2">
        <span className="text-2xl font-bold text-primary">
          {Math.round((completed / tasks.length) * 100) || 0}%
        </span>
        <span className="text-sm text-gray-500 ml-2">завершено</span>
      </div>
    </div>
  );
};

export default StatsChart;