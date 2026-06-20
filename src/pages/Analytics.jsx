import { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { TrendingUp, Moon, Dumbbell, Tag, Calendar, BarChart2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const CARD = ({ title, value, sub, color, icon: Icon }) => (
  <div className="glass rounded-2xl p-5 border border-white/5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-gray-400 text-xs">{title}</span>
      {Icon && <Icon size={16} style={{ color }} />}
    </div>
    <p className="font-display font-bold text-2xl" style={{ color }}>{value}</p>
    {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 text-xs border border-white/10 shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>
      ))}
    </div>
  );
};

const DEMO_ANALYTICS = {
  avgMood: 6.4, avgSleep: 6.8, exerciseDays: 8, totalLogs: 22,
  moodTrend: Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    avgMood: +(4 + Math.random() * 5).toFixed(1)
  })),
  sleepMoodCorrelation: Array.from({ length: 15 }, () => ({ sleep: +(4 + Math.random() * 5).toFixed(1), mood: +(3 + Math.random() * 6).toFixed(1) })),
  topTags: [['exam', 8], ['anxiety', 5], ['sleep', 4], ['social', 3], ['exercise', 2]],
  academicMoodData: Array.from({ length: 15 }, () => ({ academicLoad: +(1 + Math.random() * 9).toFixed(1), mood: +(2 + Math.random() * 7).toFixed(1) })),
  crisisLogsCount: 1,
};

const MOOD_COLOR = (v) => {
  if (v >= 8) return '#34d399';
  if (v >= 6) return '#4ade80';
  if (v >= 4) return '#facc15';
  return '#f87171';
};

export default function Analytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = (d = days) => {
    setLoading(true);
    API.get(`/mood/analytics?days=${d}`).then(r => {
      const d2 = r.data.data;
      setData(Object.keys(d2 || {}).length > 0 ? d2 : DEMO_ANALYTICS);
    }).catch(() => setData(DEMO_ANALYTICS)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [days]);

  const getMoodLabel = (v) => {
    if (!v) return '–';
    if (v >= 8) return `${v} 😄`;
    if (v >= 6) return `${v} 🙂`;
    if (v >= 4) return `${v} 😐`;
    return `${v} 😕`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl flex items-center gap-3"><BarChart2 size={24} className="text-purple-400" /> Analytics Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Visual insights into your mental wellness journey</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 14, 30, 60].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${days === d ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
              {d}d
            </button>
          ))}
          <button onClick={() => load(days)} className="p-1.5 rounded-xl glass border border-white/10 text-gray-400 hover:text-purple-400 transition-all">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
        </div>
      ) : data && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CARD title="Average Mood" value={getMoodLabel(data.avgMood)} sub={`Over ${days} days`} color="#a78bfa" icon={TrendingUp} />
            <CARD title="Avg Sleep" value={`${data.avgSleep?.toFixed(1) || '–'}h`} sub="Hours per night" color="#60a5fa" icon={Moon} />
            <CARD title="Exercise Days" value={data.exerciseDays ?? '–'} sub={`In ${days} days`} color="#34d399" icon={Dumbbell} />
            <CARD title="Mood Logs" value={data.totalLogs ?? '–'} sub="Total entries" color="#f9a8d4" icon={Calendar} />
          </div>

          {/* Mood trend chart */}
          <div className="glass rounded-2xl p-6 border border-white/5">
            <h2 className="font-semibold text-sm text-gray-300 mb-5 flex items-center gap-2"><TrendingUp size={15} className="text-purple-400" /> Mood Trend ({days} Days)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.moodTrend || []}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="avgMood" name="Mood" stroke="#8b5cf6" fill="url(#moodGrad)" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Two-column charts */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Sleep vs Mood */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <h2 className="font-semibold text-sm text-gray-300 mb-4 flex items-center gap-2"><Moon size={14} className="text-blue-400" /> Sleep vs Mood Correlation</h2>
              <ResponsiveContainer width="100%" height={200}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="sleep" name="Sleep (hrs)" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: 'Sleep hrs', position: 'insideBottom', offset: -2, fill: '#4b5563', fontSize: 10 }} />
                  <YAxis dataKey="mood" name="Mood" domain={[0, 10]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Scatter name="Data" data={data.sleepMoodCorrelation || []} fill="#60a5fa" opacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Academic load vs mood */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <h2 className="font-semibold text-sm text-gray-300 mb-4 flex items-center gap-2"><BarChart2 size={14} className="text-amber-400" /> Academic Load vs Mood</h2>
              <ResponsiveContainer width="100%" height={200}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="academicLoad" name="Load" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: 'Academic load', position: 'insideBottom', offset: -2, fill: '#4b5563', fontSize: 10 }} />
                  <YAxis dataKey="mood" name="Mood" domain={[0, 10]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Scatter name="Data" data={data.academicMoodData || []} fill="#fbbf24" opacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top tags */}
          {data.topTags?.length > 0 && (
            <div className="glass rounded-2xl p-5 border border-white/5">
              <h2 className="font-semibold text-sm text-gray-300 mb-4 flex items-center gap-2"><Tag size={14} className="text-pink-400" /> Top Mood Tags</h2>
              <div className="space-y-2">
                {data.topTags.map(([tag, count], i) => {
                  const pct = Math.round((count / (data.topTags[0][1] || 1)) * 100);
                  const colors = ['#8b5cf6','#60a5fa','#34d399','#fbbf24','#f87171'];
                  return (
                    <div key={tag} className="flex items-center gap-3">
                      <span className="text-gray-400 text-xs w-24 capitalize">#{tag}</span>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                      </div>
                      <span className="text-gray-500 text-xs w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Crisis notice */}
          {data.crisisLogsCount > 0 && (
            <div className="glass rounded-2xl p-4 border border-red-500/20 bg-red-500/5 flex items-center gap-4">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-red-300 font-semibold text-sm">Crisis Keywords Detected</p>
                <p className="text-gray-400 text-xs mt-0.5">{data.crisisLogsCount} mood log(s) contained distress signals. Please reach out to a counselor if you're struggling.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
