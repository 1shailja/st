import React, { useState, useEffect } from 'react';
import { AppView, StudySession, TodoItem } from './types';
import { Timer } from './components/Timer';
import { TaskList } from './components/TaskList';
import { Analytics } from './components/Analytics';
import { getAccountabilityCoaching } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.TASKS);
  
  // Robust initial state loading with error handling
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    try {
      const saved = localStorage.getItem('study_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error parsing sessions:", e);
      return [];
    }
  });
  
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const saved = localStorage.getItem('study_todos');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error parsing todos:", e);
      return [];
    }
  });

  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  useEffect(() => {
    localStorage.setItem('study_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('study_todos', JSON.stringify(todos));
  }, [todos]);

  const handleSaveSession = (session: StudySession) => {
    setSessions(prev => [...prev, session]);
  };

  const fetchAdvice = async () => {
    setIsLoadingAi(true);
    // We only send the last 20 sessions to the AI to keep payload light and relevant
    const recentSessions = sessions.slice(-20);
    const advice = await getAccountabilityCoaching(recentSessions, todos);
    setAiAdvice(advice);
    setIsLoadingAi(false);
  };

  const NavItem = ({ view, label, icon }: { view: AppView; label: string; icon: React.ReactNode }) => (
    <button 
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-3 w-full px-4 py-4 rounded-xl transition-all font-bold tracking-wide ${
        currentView === view 
          ? 'bg-white text-orange-600 shadow-lg translate-x-2' 
          : 'text-white hover:bg-orange-500/50'
      }`}
    >
      {icon}
      <span className="uppercase">{label}</span>
    </button>
  );

  const MobileNavItem = ({ view, label, icon }: { view: AppView; label: string; icon: React.ReactNode }) => (
    <button 
      onClick={() => setCurrentView(view)}
      className={`flex flex-col items-center justify-center p-2 w-full transition-colors ${
        currentView === view ? 'text-orange-600' : 'text-gray-400 hover:text-orange-400'
      }`}
    >
      <div className={`${currentView === view ? 'transform scale-110' : ''} transition-transform`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider mt-1">{label}</span>
    </button>
  );

  // Icons
  const IconTasks = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
  const IconTimer = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  const IconStats = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
  const IconCoach = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;

  return (
    <div className="flex min-h-screen bg-orange-50 text-gray-800 font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-orange-600 shadow-2xl flex flex-col fixed h-full z-20 hidden md:flex">
        <div className="p-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            STUDY<span className="text-orange-200">TRACKER</span>
          </h1>
          <p className="text-xs text-orange-100 mt-2 font-medium uppercase tracking-wider opacity-80">Accountability Partner</p>
        </div>

        <nav className="flex-1 px-6 space-y-4 mt-4">
          <NavItem view={AppView.TASKS} label="Tasks" icon={IconTasks} />
          <NavItem view={AppView.TIMER} label="Timer" icon={IconTimer} />
          <NavItem view={AppView.ANALYTICS} label="Stats" icon={IconStats} />
        </nav>

        <div className="p-6">
           <div className="bg-orange-700/50 p-5 rounded-2xl border border-orange-400/30 backdrop-blur-sm">
             <div className="flex items-center gap-2 mb-3">
               <svg className="w-5 h-5 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               <span className="font-bold text-sm text-white uppercase tracking-wider">AI Coach</span>
             </div>
             <p className="text-xs text-white/90 italic mb-4 leading-relaxed font-medium">
               {aiAdvice || "Ready to crush your goals?"}
             </p>
             <button 
               onClick={fetchAdvice}
               disabled={isLoadingAi}
               className="w-full py-2 px-3 bg-white hover:bg-orange-50 text-orange-600 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-70 shadow-sm"
             >
               {isLoadingAi ? 'Thinking...' : 'Get Motivation'}
             </button>
           </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 w-full bg-orange-600 z-30 shadow-md p-4 flex justify-center items-center">
        <h1 className="text-lg font-extrabold text-white tracking-tight">STUDY<span className="text-orange-200">TRACKER</span></h1>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 w-full bg-white z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-orange-100 flex justify-between px-2 pb-safe safe-area-inset-bottom">
        <MobileNavItem view={AppView.TASKS} label="Tasks" icon={IconTasks} />
        <MobileNavItem view={AppView.TIMER} label="Timer" icon={IconTimer} />
        <MobileNavItem view={AppView.ANALYTICS} label="Stats" icon={IconStats} />
        <MobileNavItem view={AppView.COACH} label="Coach" icon={IconCoach} />
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 md:p-10 pt-20 pb-24 md:pt-10 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {currentView === AppView.TASKS && (
            <div className="animate-fade-in">
              <TaskList todos={todos} setTodos={setTodos} />
            </div>
          )}
          
          {/* 
            CRITICAL: 
            We use a CSS class to hide the Timer instead of conditionally rendering it.
            This keeps the Timer component mounted (and the interval running) 
            even when the user switches to the Tasks or Stats view.
          */}
          <div className={currentView === AppView.TIMER ? "block animate-fade-in" : "hidden"}>
            <Timer onSaveSession={handleSaveSession} />
          </div>

          {currentView === AppView.ANALYTICS && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-end mb-8 border-b-2 border-orange-100 pb-4">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 uppercase tracking-tight">My <span className="text-orange-600">Stats</span></h2>
                <div className="text-[10px] md:text-xs font-bold text-orange-400 uppercase tracking-wider bg-white px-2 py-1 rounded border border-orange-100">
                  Local Storage
                </div>
              </div>
              <Analytics sessions={sessions} />
            </div>
          )}

          {/* Mobile Only Coach View */}
          {currentView === AppView.COACH && (
            <div className="animate-fade-in md:hidden flex flex-col items-center justify-center min-h-[50vh]">
              <div className="w-full bg-white p-8 rounded-3xl shadow-xl border border-orange-100 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800 uppercase mb-4">AI Coach</h2>
                <p className="text-gray-600 mb-8 italic text-lg leading-relaxed">
                  "{aiAdvice || "I'm here to analyze your progress and keep you on track. Ready?"}"
                </p>
                <button 
                  onClick={fetchAdvice}
                  disabled={isLoadingAi}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-xl uppercase tracking-wider shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
                >
                  {isLoadingAi ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Thinking...
                    </>
                  ) : (
                    'Get Motivation'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;