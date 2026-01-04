import React, { useState, useEffect } from "react";
import { AppView, StudySession, TodoItem } from "./types";
import { Timer } from "./components/Timer";
import { TaskList } from "./components/TaskList";
import { Analytics } from "./components/Analytics";
import { getAccountabilityCoaching } from "./services/geminiService";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.TASKS);

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    try {
      const saved = localStorage.getItem("study_sessions");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const saved = localStorage.getItem("study_todos");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [aiAdvice, setAiAdvice] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  useEffect(() => {
    localStorage.setItem("study_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("study_todos", JSON.stringify(todos));
  }, [todos]);

  const handleSaveSession = (session: StudySession) => {
    setSessions((prev) => [...prev, session]);
  };

  const fetchAdvice = async () => {
    setIsLoadingAi(true);
    const recentSessions = sessions.slice(-20);
    const advice = await getAccountabilityCoaching(recentSessions, todos);
    setAiAdvice(advice);
    setIsLoadingAi(false);
  };

  const NavItem = ({
    view,
    label,
    icon,
  }: {
    view: AppView;
    label: string;
    icon: React.ReactNode;
  }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-3 w-full px-4 py-4 rounded-xl font-bold transition ${
        currentView === view
          ? "bg-white text-orange-600 shadow-lg"
          : "text-white hover:bg-orange-500/50"
      }`}
    >
      {icon}
      <span className="uppercase">{label}</span>
    </button>
  );

  const IconTasks = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    </svg>
  );

  const IconTimer = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const IconStats = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5" />
    </svg>
  );

  return (
    <div className="flex min-h-screen bg-orange-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-72 bg-orange-600 fixed h-full hidden md:flex flex-col">
        <div className="p-8">
          <h1 className="text-3xl font-extrabold text-white">
            STUDY<span className="text-orange-200">TRACKER</span>
          </h1>
          <p className="text-xs text-orange-100 mt-2 uppercase">
            Accountability Partner
          </p>
        </div>

        <nav className="flex-1 px-6 space-y-4">
          <NavItem view={AppView.TASKS} label="Tasks" icon={IconTasks} />
          <NavItem view={AppView.TIMER} label="Timer" icon={IconTimer} />
          <NavItem view={AppView.ANALYTICS} label="Stats" icon={IconStats} />
        </nav>

        <div className="p-6">
          <div className="bg-orange-700/50 p-5 rounded-xl">
            <p className="text-white text-sm italic mb-4">
              {aiAdvice || "Ready to stay focused?"}
            </p>
            <button
              onClick={fetchAdvice}
              disabled={isLoadingAi}
              className="w-full bg-white text-orange-600 py-2 rounded-lg font-bold"
            >
              {isLoadingAi ? "Thinking..." : "Get Motivation"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-72 p-6">
        {currentView === AppView.TASKS && (
          <TaskList todos={todos} setTodos={setTodos} />
        )}

        {currentView === AppView.TIMER && (
          <Timer onSaveSession={handleSaveSession} />
        )}

        {currentView === AppView.ANALYTICS && (
          <Analytics sessions={sessions} />
        )}
      </main>
    </div>
  );
};

export default App;
