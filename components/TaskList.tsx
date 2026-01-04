import React, { useState } from 'react';
import { TodoItem } from '../types';

interface TaskListProps {
  todos: TodoItem[];
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
}

export const TaskList: React.FC<TaskListProps> = ({ todos, setTodos }) => {
  const [newTask, setNewTask] = useState('');
  
  // FIX: Use local date instead of UTC to prevent timezone issues (e.g. showing "tomorrow" in the evening)
  const getLocalDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return (new Date(d.getTime() - offset)).toISOString().slice(0, 10);
  };

  const [filterDate, setFilterDate] = useState(getLocalDate());

  const addTask = () => {
    if (!newTask.trim()) return;
    const item: TodoItem = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
      date: filterDate,
      priority: 'medium'
    };
    setTodos(prev => [...prev, item]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const filteredTodos = todos.filter(t => t.date === filterDate);
  const progress = filteredTodos.length > 0 
    ? Math.round((filteredTodos.filter(t => t.completed).length / filteredTodos.length) * 100) 
    : 0;

  return (
    <div className="relative bg-white rounded-3xl shadow-xl border border-orange-100 p-5 md:p-8 min-h-[500px] md:min-h-[600px] overflow-hidden">
      {/* Vertical Left Accent Line */}
      <div className="absolute left-0 top-0 bottom-0 w-2 md:w-4 bg-orange-500"></div>
      
      <div className="pl-4 md:pl-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 md:mb-8 gap-4">
          <div>
            <h2 className="text-xl md:text-3xl font-extrabold text-gray-800 uppercase tracking-tight leading-tight">
              Tasks <span className="text-orange-500">&</span><br className="hidden md:inline"/> Targets
            </h2>
            <p className="text-gray-400 text-xs md:text-sm mt-1 font-medium hidden md:block">Manage your daily study goals</p>
          </div>
          <div className="flex flex-col md:items-end w-full md:w-auto">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 mr-1">Date</label>
             <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full md:w-auto bg-orange-50 text-gray-800 border-2 border-orange-100 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 font-bold text-sm"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 md:mb-8 bg-orange-50 p-4 rounded-xl border border-orange-100">
          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            <span>Daily Completion</span>
            <span className="text-orange-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-700 shadow-sm" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Input */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-8">
          <input 
            type="text" 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="New study target..."
            className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 px-5 py-3 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-sm md:text-base"
          />
          <button 
            onClick={addTask}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-lg shadow-orange-200 active:scale-95 transform"
          >
            Add
          </button>
        </div>

        {/* List */}
        <div className="space-y-3 md:space-y-4">
          {filteredTodos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 md:py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
               <svg className="w-10 h-10 md:w-12 md:h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
               <span className="font-medium text-sm">No tasks for this date</span>
            </div>
          )}
          
          {filteredTodos.map(task => (
            <div 
              key={task.id} 
              className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-2 transition-all duration-200 ${
                task.completed 
                  ? 'bg-orange-50 border-orange-100 opacity-75' 
                  : 'bg-white border-gray-100 hover:border-orange-200 hover:shadow-md'
              }`}
            >
              <button 
                onClick={() => toggleTask(task.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                  task.completed ? 'bg-orange-500 border-orange-500' : 'border-gray-300 hover:border-orange-400'
                }`}
              >
                {task.completed && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className={`flex-1 text-base md:text-lg font-medium break-words ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {task.text}
              </span>
              <button 
                onClick={() => deleteTask(task.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};