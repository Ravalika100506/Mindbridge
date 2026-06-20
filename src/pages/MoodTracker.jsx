import { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Heart, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const MOOD_OPTIONS = [
  { value: 1,  emoji: '😭', label: 'Terrible'  },
  { value: 2,  emoji: '😢', label: 'Very Bad'  },
  { value: 3,  emoji: '😞', label: 'Bad'        },
  { value: 4,  emoji: '😕', label: 'Low'        },
  { value: 5,  emoji: '😐', label: 'Neutral'    },
  { value: 6,  emoji: '🙂', label: 'Okay'       },
  { value: 7,  emoji: '😊', label: 'Good'       },
  { value: 8,  emoji: '😄', label: 'Great'      },
  { value: 9,  emoji: '🤩', label: 'Amazing'    },
  { value: 10, emoji: '🌟', label: 'Excellent'  },
];

const TAGS = [
  'exam', 'assignment', 'social', 'sleep_issue', 'exercise',
  'family', 'heartbreak', 'achievement', 'anxiety', 'lonely',
  'grateful', 'overwhelmed', 'excited'
];

const SYMPTOMS = [
  'headache', 'fatigue', 'appetite_loss', 'insomnia',
  'concentration_issues', 'tension', 'nausea'
];

const getMoodColor = (score) => {
  if (score <= 2) return '#f43f5e';
  if (score <= 4) return '#fb923c';
  if (score <= 6) return '#facc15';
  if (score <= 8) return '#4ade80';
  return '#34d399';
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const m = MOOD_OPTIONS.find(o => o.value === Math.round(payload[0].value));
    return (
      <div className="glass rounded-xl p-3 text-xs border border-white/10">
        <p className="text-gray-400 mb-1">{label}</p>
        <p className="font-semibold" style={{ color: getMoodColor(payload[0].value) }}>
          {m?.emoji} {payload[0].value}/10 — {m?.label}
        </p>
      </div>
    );
  }
  return null;
};

export default function MoodTracker() {
  const [mood, setMood] = useState(5);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [academicLoad, setAcademicLoad] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [exercised, setExercised] = useState(false);
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('log');

  const loadData = () => {
    API.get('/mood?days=30&limit=50').then(r => setHistory(r.data.data || [])).catch(() => {});
    API.get('/mood/analytics?days=30').then(r => setAnalytics(r.data.data)).catch(() => {});
  };

  useEffect(() => { loadData(); }, []);

  const toggleTag = (t) =>
    setSelectedTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const toggleSymptom = (s) =>
    setSelectedSymptoms(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const moodOption = MOOD_OPTIONS.find(m => m.value === mood);
      const res = await API.post('/mood', {
        mood, note,
        tags: selectedTags,
        academicLoad, sleepHours, exercised,
        physicalSymptoms: selectedSymptoms,
        emoji: moodOption?.emoji,
        label: moodOption?.label
      });

      if (res.data.crisisDetected) {
        toast.error('We noticed you might be struggling. Please check Crisis Support. 💜', { duration: 6000 });
      } else {
        toast.success(`Mood logged! +${res.data.xpGained} XP 🎉`);
      }

      // Reset form
      setNote('');
      setSelectedTags([]);
      setSelectedSymptoms([]);
      setExercised(false);

      // Fix 6: Show confirmation banner then auto-dismiss after 5 seconds
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);

      // Refresh data
      loadData();
    } catch {
      toast.error('Failed to log mood. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentMoodOption = MOOD_OPTIONS.find(m => m.value === mood);
  const moodColor = getMoodColor(mood);

  // Chart data: history is newest-first, reverse for chart
  const chartData = [...history].reverse().map(m => ({
    date: new Date(m.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    mood: m.mood,
    sleep: m.sleepHours
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl">Mood Tracker</h1>
          <p className="text-gray-400 text-sm mt-1">How are you feeling right now?</p>
        </div>
        <div className="flex gap-2">
          {['log', 'history', 'analytics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── LOG TAB ── */}
      {activeTab === 'log' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Mood Selector */}
            <div className="card">
              <h2 className="font-semibold text-sm mb-4">Select Your Mood</h2>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {MOOD_OPTIONS.map(({ value, emoji, label }) => (
                  <button
                    key={value}
                    onClick={() => setMood(value)}
                    className={`mood-btn ${mood === value ? 'active' : ''}`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs text-gray-500">{label}</span>
                  </button>
                ))}
              </div>
              <div className="text-center">
                <div className="text-5xl mb-2">{currentMoodOption?.emoji}</div>
                <div className="font-display font-bold text-xl" style={{ color: moodColor }}>
                  {mood}/10 — {currentMoodOption?.label}
                </div>
                <input
                  type="range" min="1" max="10" value={mood}
                  onChange={e => setMood(Number(e.target.value))}
                  className="w-full mt-4"
                />
              </div>
            </div>

            {/* Context sliders */}
            <div className="card space-y-5">
              <h2 className="font-semibold text-sm">Context (Optional)</h2>
              <div>
                <label className="text-xs text-gray-400 mb-2 block">
                  Academic workload today: <span className="text-purple-400 font-medium">{academicLoad}/10</span>
                </label>
                <input
                  type="range" min="0" max="10" value={academicLoad}
                  onChange={e => setAcademicLoad(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block">
                  Sleep last night: <span className="text-cyan-400 font-medium">{sleepHours}h</span>
                </label>
                <input
                  type="range" min="0" max="12" step="0.5" value={sleepHours}
                  onChange={e => setSleepHours(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <button
                onClick={() => setExercised(!exercised)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  exercised
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                }`}
              >
                {exercised ? '✅' : '🏃'} Exercised Today
              </button>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="card">
              <h2 className="font-semibold text-sm mb-3">What's affecting you?</h2>
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Physical symptoms */}
            <div className="card">
              <h2 className="font-semibold text-sm mb-3">Physical symptoms (if any)</h2>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedSymptoms.includes(s)
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="card">
              <h2 className="font-semibold text-sm mb-3">Add a note (optional)</h2>
              <textarea
                className="input-field"
                placeholder="What's on your mind? Everything here is private…"
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={4}
              />
              {mood <= 3 && (
                <div className="mt-3 flex items-start gap-2 p-3 rounded-xl text-xs"
                  style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.15)' }}>
                  <AlertTriangle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
                  <span className="text-rose-300">
                    If you're having thoughts of self-harm, please visit{' '}
                    <Link to="/crisis" className="underline font-medium">Crisis Support</Link>
                    {' '}or call iCall: 9152987821
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary w-full py-3.5"
            >
              {submitting
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Heart size={18} />
              }
              {submitting ? 'Logging…' : 'Log Mood  +10 XP'}
            </button>

            {/* Fix 6: auto-dismisses after 5 seconds */}
            {submitted && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm text-emerald-400 animate-slide-up"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <CheckCircle size={16} />
                Mood logged! Keep the streak going 🔥
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              <Heart size={40} className="mx-auto mb-3 text-gray-700" />
              <p>No mood logs yet. Start tracking today!</p>
              <button onClick={() => setActiveTab('log')} className="btn-primary mt-4 text-sm px-4 py-2">
                Log First Mood
              </button>
            </div>
          ) : history.map(log => {
            const m = MOOD_OPTIONS.find(o => o.value === log.mood);
            const color = getMoodColor(log.mood);
            return (
              <div key={log._id} className="card flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">{m?.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color }}>{log.mood}/10 — {m?.label}</span>
                    {log.crisisKeywordsDetected && (
                      <AlertTriangle size={14} className="text-rose-400" />
                    )}
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
                    <span>😴 {log.sleepHours}h</span>
                    <span>📚 Load: {log.academicLoad}/10</span>
                    {log.exercised && <span>🏃 Exercised</span>}
                  </div>
                  {log.tags?.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {log.tags.map(t => (
                        <span key={t} className="badge bg-purple-500/10 text-purple-400 text-xs">#{t}</span>
                      ))}
                    </div>
                  )}
                  {log.note && (
                    <p className="text-xs text-gray-500 mt-1.5 italic line-clamp-2">"{log.note}"</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-gray-600">
                    {new Date(log.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(log.date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {!analytics || Object.keys(analytics).length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              <TrendingUp size={40} className="mx-auto mb-3 text-gray-700" />
              <p>No analytics yet. Log your mood for a few days to see trends!</p>
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Avg Mood',    value: `${analytics.avgMood}/10`,       color: '#8b5cf6' },
                  { label: 'Avg Sleep',   value: `${analytics.avgSleep}h`,         color: '#06b6d4' },
                  { label: 'Active Days', value: analytics.exerciseDays,            color: '#10b981' },
                  { label: 'Total Logs',  value: analytics.totalLogs,               color: '#f59e0b' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="stat-card text-center">
                    <div className="font-display font-bold text-2xl" style={{ color }}>{value}</div>
                    <div className="text-xs text-gray-500 mt-1">{label}</div>
                  </div>
                ))}
              </div>

              {/* Trend chart */}
              {chartData.length > 1 && (
                <div className="card">
                  <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-purple-400" /> Mood Over Time
                  </h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="moodG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[1, 10]} tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={2} fill="url(#moodG)" dot={{ fill: '#8b5cf6', r: 3, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top tags */}
              {analytics.topTags?.length > 0 && (
                <div className="card">
                  <h2 className="font-semibold text-sm mb-3">Top Mood Tags</h2>
                  <div className="space-y-2">
                    {analytics.topTags.map(([tag, count]) => (
                      <div key={tag} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-28">#{tag}</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-purple-500 transition-all duration-700"
                            style={{ width: `${(count / analytics.topTags[0][1]) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
