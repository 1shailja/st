import React, { useState, useEffect, useRef } from 'react';
import { StudySession } from '../types';

interface TimerProps {
  onSaveSession: (session: StudySession) => void;
}

export const Timer: React.FC<TimerProps> = ({ onSaveSession }) => {
  // Initialize state from localStorage to persist across refreshes
  const [seconds, setSeconds] = useState(() => {
    const saved = parseInt(localStorage.getItem('timer_seconds') || '0', 10);
    const wasActive = localStorage.getItem('timer_isActive') === 'true';
    const lastTime = parseInt(localStorage.getItem('timer_lastTimestamp') || Date.now().toString(), 10);
    
    // If it was running, add the time missed while closed/refreshed
    if (wasActive) {
      const elapsed = Math.floor((Date.now() - lastTime) / 1000);
      return saved + Math.max(0, elapsed);
    }
    return saved;
  });

  const [isActive, setIsActive] = useState(() => {
    return localStorage.getItem('timer_isActive') === 'true';
  });

  const [subject, setSubject] = useState(() => {
    return localStorage.getItem('timer_subject') || '';
  });

  // Ref to track start time for accurate drift-less counting.
  // We initialize it such that (Now - Start) equals the current 'seconds'.
  const startTimeRef = useRef<number>(Date.now() - seconds * 1000);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('timer_seconds', seconds.toString());
    localStorage.setItem('timer_isActive', isActive.toString());
    localStorage.setItem('timer_subject', subject);
    localStorage.setItem('timer_lastTimestamp', Date.now().toString());
  }, [seconds, isActive, subject]);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive) {
      // Reset start time ref based on current seconds to ensure continuity when resuming
      startTimeRef.current = Date.now() - seconds * 1000;

      interval = window.setInterval(() => {
        // Drift-less timing: Calculate diff from start instead of just incrementing +1
        // This handles browser throttling/backgrounding perfectly
        const now = Date.now();
        setSeconds(Math.floor((now - startTimeRef.current) / 1000));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive]); 

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
    // We don't clear subject here, users might want to re-time the same subject
    localStorage.removeItem('timer_seconds');
    localStorage.removeItem('timer_isActive');
  };

  const handleSave = () => {
    if (seconds < 60) {
      if(!window.confirm("Session is less than 1 minute. Save anyway?")) return;
    }
    
    // Use local date for accurate daily tracking
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    const localDate = (new Date(d.getTime() - offset)).toISOString().slice(0, 10);

    const newSession: StudySession = {
      id: Date.now().toString(),
      subject: subject.trim() || 'General Study',
      durationSeconds: seconds,
      startTime: new Date().toISOString(),
      date: localDate
    };

    onSaveSession(newSession);
    
    // Full reset after save
    setIsActive(false);
    setSeconds(0);
    setSubject('');
    localStorage.removeItem('timer_seconds');
    localStorage.removeItem('timer_isActive');
    localStorage.removeItem('timer_subject');
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-10 bg-white rounded-3xl shadow-2xl border border-orange-100 max-w-lg mx-auto mt-4 md:mt-10">
      <div className="w-12 md:w-16 h-1 bg-orange-500 rounded-full mb-6 md:mb-8"></div>
      <h2 className="text-2xl md:text-3xl font-extrabold mb-6 md:mb-8 text-gray-800 uppercase tracking-tight">Focus Timer</h2>
      
      <input 
        type="text"
        placeholder="Subject (Optional)"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full mb-6 md:mb-8 px-4 md:px-6 py-3 md:py-4 bg-gray-50 border-2 border-transparent hover:border-gray-200 focus:border-orange-500 rounded-2xl text-gray-800 text-base md:text-lg font-medium focus:outline-none focus:bg-white transition-all text-center placeholder-gray-400"
      />

      <div className="text-6xl md:text-8xl font-mono mb-8 md:mb-10 text-orange-600 font-bold tracking-wider tabular-nums">
        {formatTime(seconds)}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <button 
          onClick={toggleTimer}
          className={`w-full py-4 px-6 rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 transform ${
            isActive 
              ? 'bg-gray-800 hover:bg-black text-white' 
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200'
          }`}
        >
          {isActive ? 'Pause' : 'Start Focus'}
        </button>
        
        {!isActive && seconds > 0 && (
          <div className="flex gap-3 w-full">
            <button 
              onClick={handleSave}
              className="flex-1 py-4 px-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg shadow-green-200 active:scale-95 transform text-sm md:text-base"
            >
              Save
            </button>
            <button 
              onClick={resetTimer}
              className="flex-1 py-4 px-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold uppercase tracking-wider transition-all active:scale-95 transform text-sm md:text-base"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};