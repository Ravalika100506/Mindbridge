import { useState } from 'react';
import { API } from '../context/AuthContext';
import { Brain, Plus, Trash2, Calendar, Moon, Dumbbell, TrendingUp, AlertTriangle, Shield, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const RISK_CONFIG = {
  low:    { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  label: 'Low Risk',    emoji: '🟢' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)',  label: 'Medium Risk', emoji: '🟡' },
  high:   { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)',  border: 'rgba(244,63,94,0.3)',   label: 'High Risk',   emoji: '🔴' },
};

const EVENT_TYPES = ['exam', 'assignment', 'presentation', 'group_project', 'internship', 'lab', 'other'];

export default function StressPredictor() {
  const [events, setEvents] = useState([{ title: '', type: 'exam', daysUntil: 7 }]);
  const [sleepAvg, setSleepAvg] = useState(7);
  const [exerciseFreq, setExerciseFreq] = useState(2);
  const [recentMoods, setRecentMoods] = useState(6);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const addEvent = () => setEvents(p => [...p, { title: '', type: 'exam', daysUntil: 7 }]);
  const removeEvent = (i) => setEvents(p => p.filter((_, idx) => idx !== i));
  const updateEvent = (i, key, val) => setEvents(p => p.map((e, idx) => idx === i ? { ...e, [key]: val } : e));

  const predict = async () => {
    if (events.some(e => !e.title.trim())) return toast.error('Please fill in all event titles');
    setLoading(true);
    try {
      const upcomingEvents = events.map(e => `${e.title} (${e.type}) in ${e.daysUntil} days`);
      const res = await API.post('/ai/stress-predictor', {
        upcomingEvents, sleepAvg, exerciseFrequency: exerciseFreq, recentMoods
      });
      setResult(res.data.data);
    } catch {
      toast.error('Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cfg = result ? (RISK_CONFIG[result.stressRisk] || RISK_CONFIG.medium) : null;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl flex items-center gap-3">
          <Brain size={24} className="text-purple-400" /> Academic Stress Predictor
        </h1>
        <p className="text-gray-400 text-sm mt-1">AI-powered forecast based on your upcoming deadlines and wellness data</p>
      </div>

      {/* Upcoming events */}
      <div className="glass rounded-2xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-purple-300">Upcoming Academic Events</h2>
          <button onClick={addEvent} className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 transition-all">
            <Plus size={12} /> Add Event
          </button>
        </div>
        <div className="space-y-3">
          {events.map((ev, i) => (
            <div key={i} className="flex items-center gap-2 flex-wrap">
              <input
                placeholder="Event title (e.g. Math Final Exam)"
                value={ev.title}
                onChange={e => updateEvent(i, 'title', e.target.value)}
                className="input-field flex-1 min-w-0 text-sm py-2"
              />
              <select value={ev.type} onChange={e => updateEvent(i, 'type', e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar size={13} />
                <input type="number" min={1} max={90} value={ev.daysUntil}
                  onChange={e => updateEvent(i, 'daysUntil', +e.target.value)}
                  className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-center text-sm focus:outline-none focus:border-purple-500/50" />
                <span className="text-xs">days</span>
              </div>
              {events.length > 1 && (
                <button onClick={() => removeEvent(i)} className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-400/10 transition-all">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Wellness inputs */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <h2 className="font-semibold mb-5 text-gray-300">Your Current Wellness</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs text-gray-400 mb-2 block flex items-center gap-1.5">
              <Moon size={11} /> Avg Sleep: <span className="text-blue-400 font-semibold">{sleepAvg}h</span>
            </label>
            <input type="range" min={3} max={12} step={0.5} value={sleepAvg}
              onChange={e => setSleepAvg(+e.target.value)} className="w-full accent-blue-500" />
            <div className="flex justify-between text-xs text-gray-600 mt-1"><span>3h</span><span>12h</span></div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block flex items-center gap-1.5">
              <Dumbbell size={11} /> Exercise: <span className="text-emerald-400 font-semibold">{exerciseFreq}×/wk</span>
            </label>
            <input type="range" min={0} max={7} value={exerciseFreq}
              onChange={e => setExerciseFreq(+e.target.value)} className="w-full accent-emerald-500" />
            <div className="flex justify-between text-xs text-gray-600 mt-1"><span>0</span><span>7×</span></div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block flex items-center gap-1.5">
              <TrendingUp size={11} /> Mood avg: <span className="text-purple-400 font-semibold">{recentMoods}/10</span>
            </label>
            <input type="range" min={1} max={10} value={recentMoods}
              onChange={e => setRecentMoods(+e.target.value)} className="w-full accent-purple-500" />
            <div className="flex justify-between text-xs text-gray-600 mt-1"><span>1</span><span>10</span></div>
          </div>
        </div>
      </div>

      <button onClick={predict} disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
        {loading
          ? <><RefreshCw size={18} className="animate-spin" /> Analyzing your stress profile...</>
          : <><Brain size={18} /> Predict My Stress Level</>}
      </button>

      {/* Result */}
      {result && cfg && (
        <div className="space-y-4 animate-fade-in">
          {/* Risk score */}
          <div className="glass rounded-2xl p-6 text-center border" style={{ borderColor: cfg.border, background: cfg.bg }}>
            <p className="text-4xl mb-2">{cfg.emoji}</p>
            <p className="font-display font-bold text-2xl" style={{ color: cfg.color }}>{cfg.label}</p>
            <p className="text-gray-400 text-sm mt-1">Stress Score: <span className="font-bold text-white">{result.stressScore}/10</span></p>
            <p className="text-gray-300 text-sm mt-3 max-w-md mx-auto italic">"{result.shortMessage}"</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Risk factors */}
            <div className="glass rounded-2xl p-5 border border-red-500/10">
              <h3 className="font-semibold text-sm text-red-300 mb-3 flex items-center gap-2">
                <AlertTriangle size={14} /> Risk Factors
              </h3>
              <ul className="space-y-2">
                {result.riskFactors?.map((r, i) => (
                  <li key={i} className="text-gray-300 text-sm flex gap-2 items-start">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>{r}
                  </li>
                ))}
              </ul>
            </div>
            {/* Protective factors */}
            <div className="glass rounded-2xl p-5 border border-emerald-500/10">
              <h3 className="font-semibold text-sm text-emerald-300 mb-3 flex items-center gap-2">
                <Shield size={14} /> Protective Factors
              </h3>
              <ul className="space-y-2">
                {result.protectiveFactors?.map((r, i) => (
                  <li key={i} className="text-gray-300 text-sm flex gap-2 items-start">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="glass rounded-2xl p-5 border border-purple-500/10">
            <h3 className="font-semibold text-sm text-purple-300 mb-3 flex items-center gap-2">
              <Brain size={14} /> Personalized Recommendations
            </h3>
            <ul className="space-y-2">
              {result.recommendations?.map((r, i) => (
                <li key={i} className="text-gray-300 text-sm flex gap-2 items-start">
                  <span className="text-purple-400 mt-0.5 flex-shrink-0">{i + 1}.</span>{r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
