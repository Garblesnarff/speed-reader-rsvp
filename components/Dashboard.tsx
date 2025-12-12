import React, { useMemo } from 'react';
import { ArrowLeft, TrendingUp, Book, Zap, Calendar, Activity } from 'lucide-react';
import { getHistory, getStats } from '../utils/storage';

interface DashboardProps {
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const stats = useMemo(() => getStats(), []);
  const history = useMemo(() => getHistory(), []);

  // Prepare Chart Data (Last 10 sessions)
  const chartData = useMemo(() => {
    return history
      .slice(0, 10)
      .reverse() // Oldest to newest
      .map((session, i) => ({
        index: i,
        wpm: session.wpm,
        date: new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }));
  }, [history]);

  // Simple SVG Chart Logic
  const maxWpm = Math.max(...chartData.map(d => d.wpm), 300) + 50;
  const minWpm = Math.max(Math.min(...chartData.map(d => d.wpm)) - 50, 0);
  const chartHeight = 150;
  const chartWidth = 100; // Percentage

  const getPoints = () => {
    if (chartData.length < 2) return "";
    return chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * 100;
      const y = chartHeight - ((d.wpm - minWpm) / (maxWpm - minWpm)) * chartHeight;
      return `${x},${y}`;
    }).join(" ");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-900 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">Progress Dashboard</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Book size={18} />
              <span className="text-xs uppercase tracking-wider font-semibold">Total Read</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {(stats.totalWords / 1000).toFixed(1)}k <span className="text-sm text-gray-500 font-sans">words</span>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Zap size={18} />
              <span className="text-xs uppercase tracking-wider font-semibold">Avg Speed</span>
            </div>
            <div className="text-2xl font-mono font-bold text-red-400">
              {stats.avgWpm} <span className="text-sm text-gray-500 font-sans">wpm</span>
            </div>
          </div>

           <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Calendar size={18} />
              <span className="text-xs uppercase tracking-wider font-semibold">Streak</span>
            </div>
            <div className="text-2xl font-mono font-bold text-blue-400">
              {stats.currentStreak} <span className="text-sm text-gray-500 font-sans">days</span>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Activity size={18} />
              <span className="text-xs uppercase tracking-wider font-semibold">Sessions</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {stats.totalSessions}
            </div>
          </div>
        </div>

        {/* WPM Chart */}
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-400" />
            Reading Speed History
          </h2>
          
          {chartData.length > 1 ? (
            <div className="w-full h-48 relative">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {/* Gradient */}
                <defs>
                  <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Area under curve */}
                 <polygon 
                  points={`0,${chartHeight} ${getPoints()} 100,${chartHeight}`}
                  fill="url(#gradient)"
                />

                {/* Line */}
                <polyline 
                  points={getPoints()}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Dots */}
                {chartData.map((d, i) => {
                  const x = (i / (chartData.length - 1)) * 100;
                  const y = chartHeight - ((d.wpm - minWpm) / (maxWpm - minWpm)) * chartHeight;
                  return (
                    <circle 
                      key={i} 
                      cx={`${x}%`} 
                      cy={y} 
                      r="4" 
                      className="fill-gray-900 stroke-red-500 stroke-2 hover:r-6 transition-all"
                    >
                      <title>{d.wpm} WPM on {d.date}</title>
                    </circle>
                  );
                })}
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between mt-2 text-xs text-gray-500 font-mono">
                 {chartData.map((d, i) => (
                   <span key={i} className={i % 2 !== 0 ? 'hidden sm:block' : ''}>{d.date}</span>
                 ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500 italic">
              Read more sessions to see your progress chart.
            </div>
          )}
        </div>

        {/* Recent History */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Sessions</h2>
          <div className="space-y-2">
            {history.slice(0, 5).map((session) => (
              <div key={session.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex justify-between items-center hover:border-gray-700 transition-colors">
                 <div>
                    <div className="text-gray-300 font-medium truncate max-w-md">
                      "{session.snippet}"
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(session.timestamp).toLocaleString()} • {(session.durationSeconds / 60).toFixed(1)} mins
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-xl font-mono font-bold text-red-400">{session.wpm} <span className="text-sm text-gray-600">WPM</span></div>
                    <div className="text-xs text-gray-500">{session.wordCount} words</div>
                 </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-8 text-gray-500">No history found. Start reading!</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
