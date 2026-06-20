import { useState } from 'react';
import { API } from '../context/AuthContext';
import { Clock, Sun, Moon, BookOpen, Wind, Zap, Coffee, Apple, Dumbbell, Brain, Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  wellness:    { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', text: '#a78bfa', icon: Wind },
  mindfulness: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7', icon: Brain },
  academic:    { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#93c5fd', icon: BookOpen },
  nutrition:   { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#fcd34d', icon: Apple },
  exercise:    { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.3)',  text: '#fca5a5', icon: Dumbbell },
  social:      { bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.3)', text: '#f9a8d4', icon: Sparkles },
};

export default function RoutinePlanner() {
  const [form, setForm] = useState({ wakeTime: '7:00', bedTime: '23:00', classes: 3, studyHours: 4, exercisePreference: 'light', avgMoodScore: 6 });
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const r = await API.post('/ai/routine-planner', form);
      setRoutine(r.data.data);
      toast.success('Your personalized routine is ready! 🗓️');
    } catch {
      toast.error('Failed to generate routine');
    } finally { setLoading(false); }
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl">Smart Routine Planner</h1>
        <p className="text-gray-400 text-sm mt-1">AI-powered personalized daily schedule for student wellbeing</p>
      </div>

      {/* Form */}
      <div className="glass rounded-2xl p-6 border border-purple-500/20">
        <h2 className="font-display font-semibold mb-5 text-purple-300 flex items-center gap-2"><Sparkles size={16} /> Personalize Your Routine</h2>
        <div className="grid md:grid-cols-3 gap-5">
          <div>
            <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1"><Sun size={11} /> Wake-up Time</label>
            <input type="time" value={form.wakeTime} onChange={e => set('wakeTime', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1"><Moon size={11} /> Bed Time</label>
            <input type="time" value={form.bedTime} onChange={e => set('bedTime', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1"><BookOpen size={11} /> Classes/Day: {form.classes}</label>
            <input type="range" min={1} max={8} value={form.classes} onChange={e => set('classes', +e.target.value)}
              className="w-full mt-3 accent-purple-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1"><Brain size={11} /> Study Hours/Day: {form.studyHours}</label>
            <input type="range" min={1} max={10} value={form.studyHours} onChange={e => set('studyHours', +e.target.value)}
              className="w-full mt-3 accent-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1"><Dumbbell size={11} /> Exercise Preference</label>
            <select value={form.exercisePreference} onChange={e => set('exercisePreference', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50">
              <option value="none">None / Rest</option>
              <option value="light">Light (Walk, Yoga)</option>
              <option value="moderate">Moderate (Gym, Swim)</option>
              <option value="intense">Intense (Sports, Run)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1"><Zap size={11} /> Recent Mood: {form.avgMoodScore}/10</label>
            <input type="range" min={1} max={10} value={form.avgMoodScore} onChange={e => set('avgMoodScore', +e.target.value)}
              className="w-full mt-3 accent-emerald-500" />
          </div>
        </div>
        <button onClick={generate} disabled={loading}
          className="btn-primary mt-6 flex items-center gap-2 mx-auto px-10">
          {loading ? <><RefreshCw size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate My Routine</>}
        </button>
      </div>

      {/* Routine output */}
      {routine && (
        <div className="space-y-5">
          {/* Motivational note */}
          <div className="glass rounded-2xl p-5 border border-emerald-500/20 text-center">
            <p className="text-emerald-300 italic text-sm">"{routine.motivationalNote}"</p>
          </div>

          {/* Schedule */}
          <div className="glass rounded-2xl p-6 border border-white/5">
            <h2 className="font-display font-semibold text-lg mb-5 flex items-center gap-2"><Clock size={18} className="text-purple-400" /> Your Daily Schedule</h2>
            <div className="space-y-2">
              {routine.schedule?.map((item, i) => {
                const cfg = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.wellness;
                const Icon = cfg.icon;
                return (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-white/5"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <div className="w-16 text-xs font-mono flex-shrink-0" style={{ color: cfg.text }}>{item.time}</div>
                    <Icon size={14} style={{ color: cfg.text }} className="flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.icon} {item.activity}</p>
                    </div>
                    <span className="text-xs text-gray-500">{item.duration} min</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips grid */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Study tips */}
            <div className="glass rounded-2xl p-5 border border-blue-500/20">
              <h3 className="font-semibold text-sm text-blue-300 mb-3 flex items-center gap-2"><BookOpen size={14} /> Study Tips</h3>
              <ul className="space-y-2">
                {routine.studyTips?.map((t, i) => <li key={i} className="text-gray-300 text-sm flex gap-2"><span className="text-blue-400 mt-0.5">•</span>{t}</li>)}
              </ul>
            </div>
            {/* Break reminders */}
            <div className="glass rounded-2xl p-5 border border-amber-500/20">
              <h3 className="font-semibold text-sm text-amber-300 mb-3 flex items-center gap-2"><Coffee size={14} /> Break Reminders</h3>
              <ul className="space-y-2">
                {routine.breakReminders?.map((b, i) => <li key={i} className="text-gray-300 text-sm flex gap-2"><span className="text-amber-400 mt-0.5">⏰</span>{b}</li>)}
              </ul>
            </div>
          </div>

          {/* Sleep tip */}
          {routine.sleepTip && (
            <div className="glass rounded-2xl p-5 border border-indigo-500/20 flex items-center gap-4">
              <Moon size={24} className="text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-indigo-300 font-semibold mb-1">Sleep Tip</p>
                <p className="text-gray-300 text-sm">{routine.sleepTip}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
