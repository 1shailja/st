import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { StudySession } from '../types';

interface AnalyticsProps {
  sessions: StudySession[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ sessions }) => {
  
  // Helper to format minutes
  const toMinutes = (seconds: number) => Math.round(seconds / 60);

  const overallStats = useMemo(() => {
    const totalSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const totalSessions = sessions.length;
    return {
      totalHours: (totalSeconds / 3600).toFixed(1),
      count: totalSessions,
      avgMinutes: totalSessions > 0 ? Math.round((totalSeconds / totalSessions) / 60) : 0
    };
  }, [sessions]);

  // Daily Breakdown (Last 7 days)
  const dailyData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      // FIX: Ensure we are calculating days based on Local Time
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const offset = d.getTimezoneOffset() * 60000;
      return (new Date(d.getTime() - offset)).toISOString().slice(0, 10);
    });

    return last7Days.map(dateStr => {
      const daySessions = sessions.filter(s => s.date === dateStr);
      const totalSeconds = daySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
      
      // FIX: Force date parsing to avoid timezone shift on label
      // Appending T12:00:00 ensures it falls in the middle of the day so slight offsets don't change the day
      const dateObj = new Date(dateStr + 'T12:00:00');
      
      return {
        name: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: dateStr,
        minutes: toMinutes(totalSeconds)
      };
    });
  }, [sessions]);

  // Subject Breakdown (Overall)
  const subjectData = useMemo(() => {
    const subjectMap: Record<string, number> = {};
    sessions.forEach(s => {
      subjectMap[s.subject] = (subjectMap[s.subject] || 0) + s.durationSeconds;
    });
    return Object.entries(subjectMap).map(([name, seconds]) => ({
      name,
      minutes: toMinutes(seconds)
    })).sort((a, b) => b.minutes - a.minutes);
  }, [sessions]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-orange-100 col-span-2 md:col-span-1">
          <h3 className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">Total Study Time</h3>
          <p className="text-3xl md:text-4xl font-extrabold text-orange-600 mt-2 md:mt-3">{overallStats.totalHours} <span className="text-sm md:text-lg text-gray-400 font-medium">hrs</span></p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-orange-100">
          <h3 className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">Sessions</h3>
          <p className="text-2xl md:text-4xl font-extrabold text-gray-800 mt-2 md:mt-3">{overallStats.count}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-orange-100">
          <h3 className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">Avg. Session</h3>
          <p className="text-2xl md:text-4xl font-extrabold text-orange-400 mt-2 md:mt-3">{overallStats.avgMinutes} <span className="text-sm md:text-lg text-gray-400 font-medium">min</span></p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        
        {/* Weekly Chart */}
        <div className="bg-white p-4 md:p-8 rounded-3xl shadow-xl border border-orange-50 h-72 md:h-96">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 uppercase tracking-tight">Last 7 Days <span className="text-orange-500 font-normal text-xs md:text-sm normal-case">(Minutes)</span></h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} dy={10} fontSize={12} />
              <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderColor: '#fdba74', color: '#1f2937', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                cursor={{ fill: '#fff7ed' }}
              />
              <Bar dataKey="minutes" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Breakdown */}
        <div className="bg-white p-4 md:p-8 rounded-3xl shadow-xl border border-orange-50 h-72 md:h-96">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 uppercase tracking-tight">Focus Areas <span className="text-orange-500 font-normal text-xs md:text-sm normal-case">(Minutes)</span></h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={subjectData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" horizontal={false} />
              <XAxis type="number" stroke="#9ca3af" axisLine={false} tickLine={false} fontSize={12} />
              <YAxis dataKey="name" type="category" width={80} stroke="#9ca3af" axisLine={false} tickLine={false} fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderColor: '#fdba74', color: '#1f2937', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                cursor={{ fill: '#fff7ed' }}
              />
              <Bar dataKey="minutes" fill="#fb923c" radius={[0, 4, 4, 0]}>
                 {subjectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f97316' : '#fb923c'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};