import { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { Trophy, Plus, X, Flame, Zap, Star, Target, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const GOAL_CATEGORIES = [
  { id: 'mood',        label: '❤️ Mood',        color: '#f43f5e' },
  { id: 'sleep',       label: '😴 Sleep',       color: '#8b5cf6' },
  { id: 'exercise',    label: '🏃 Exercise',    color: '#10b981' },
  { id: 'social',      label: '👥 Social',      color: '#06b6d4' },
  { id: 'academic',    label: '📚 Academic',    color: '#f59e0b' },
  { id: 'mindfulness', label: '🧘 Mindfulness', color: '#a78bfa' },
  { id: 'custom',      label: '✨ Custom',      color: '#6b7280' },
];

const BADGE_INFO = {
  week_warrior:  { emoji: '🏆', label: 'Week Warrior',  desc: '7-day streak!' },
  mood_master:   { emoji: '❤️', label: 'Mood Master',   desc: '30 mood logs' },
  zen_master:    { emoji: '🧘', label: 'Zen Master',    desc: '10 breathing sessions' },
  first_journal: { emoji: '📖', label: 'First Journal', desc: 'Wrote first entry' },
};

const LOCKED_BADGES = [
  { emoji: '📖', label: 'Journaling Streak',  desc: 'Journal 14 consecutive days' },
  { emoji: '🌅', label: 'Morning Person',     desc: 'Log mood before 9 am, 5 days' },
  { emoji: '🤝', label: 'Community Helper',  desc: 'Reply to 10 community posts' },
  { emoji: '🎯', label: 'Goal Getter',        desc: 'Complete 5 wellness goals' },
];

export default function Wellness() {
  const { user } = useAuth();   // Fix 11: removed unused updateUser
  const [goals, setGoals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('goals');
  const [form, setForm] = useState({
    title: '', description: '', category: 'custom',
    targetValue: 7, unit: 'times', frequency: 'weekly', xpReward: 20
  });
  const [submitting, setSubmitting] = useState(false);
  const [academicEvents, setAcademicEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '', type: 'exam', subject: '', dueDate: '', stressLevel: 5
  });

  useEffect(() => {
    API.get('/wellness/goals').then(r => setGoals(r.data.data || [])).catch(() => {});
    API.get('/wellness/leaderboard').then(r => setLeaderboard(r.data.data || [])).catch(() => {});
    API.get('/wellness/academic-events').then(r => setAcademicEvents(r.data.data || [])).catch(() => {});
  }, []);

  const createGoal = async () => {
    if (!form.title.trim()) return toast.error('Give your goal a title!');
    setSubmitting(true);
    try {
      const res = await API.post('/wellness/goals', form);
      setGoals(prev => [res.data.data, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', category: 'custom', targetValue: 7, unit: 'times', frequency: 'weekly', xpReward: 20 });
      toast.success('Goal created! Go crush it 💪');
    } catch {
      toast.error('Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  };

  const updateGoalProgress = async (goal, delta) => {
    const newValue = Math.min(goal.targetValue, Math.max(0, goal.currentValue + delta));
    const isCompleted = newValue >= goal.targetValue;
    try {
      const res = await API.put(`/wellness/goals/${goal._id}`, { currentValue: newValue, isCompleted });
      setGoals(prev => prev.map(g => g._id === goal._id ? res.data.data : g));
      if (isCompleted) toast.success(`Goal complete! +${goal.xpReward} XP 🎉`);
    } catch {
      toast.error('Failed to update progress');
    }
  };

  // Fix 4: Use API.delete, not API.put
  const deleteGoal = async (id) => {
    try {
      await API.delete(`/wellness/goals/${id}`);
      setGoals(prev => prev.filter(g => g._id !== id));
      toast.success('Goal removed');
    } catch {
      toast.error('Failed to delete goal');
    }
  };

  const createAcademicEvent = async () => {
    if (!eventForm.title.trim()) return toast.error('Add an event title!');
    if (!eventForm.dueDate) return toast.error('Select a due date!');
    try {
      const res = await API.post('/wellness/academic-events', eventForm);
      setAcademicEvents(prev => [...prev, res.data.data]);
      setShowEventForm(false);
      setEventForm({ title: '', type: 'exam', subject: '', dueDate: '', stressLevel: 5 });
      toast.success('Event added! 📅');
    } catch {
      toast.error('Failed to add event');
    }
  };

  const getDaysUntil = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const userRank = leaderboard.findIndex(u => u._id === user?._id) + 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl">Wellness & Goals</h1>
          <p className="text-gray-400 text-sm mt-1">Build healthy habits, earn rewards, grow stronger</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['goals', 'academic', 'leaderboard', 'badges'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* XP Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <Zap size={20} className="text-purple-400 mx-auto mb-1" />
          <div className="font-display font-bold text-2xl text-purple-400">{user?.wellness?.xp || 0}</div>
          <div className="text-xs text-gray-500">Total XP</div>
        </div>
        <div className="stat-card text-center">
          <Star size={20} className="text-amber-400 mx-auto mb-1" />
          <div className="font-display font-bold text-2xl text-amber-400">Level {user?.wellness?.level || 1}</div>
          <div className="text-xs text-gray-500">{100 - ((user?.wellness?.xp || 0) % 100)} XP to next</div>
        </div>
        <div className="stat-card text-center">
          <Trophy size={20} className="text-cyan-400 mx-auto mb-1" />
          <div className="font-display font-bold text-2xl text-cyan-400">#{userRank || '—'}</div>
          <div className="text-xs text-gray-500">Campus rank</div>
        </div>
      </div>

      {/* ── GOALS TAB ── */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">My Goals ({goals.length})</h2>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm px-4 py-2">
              <Plus size={16} /> New Goal
            </button>
          </div>

          {showForm && (
            <div className="card p-5 space-y-4 animate-scale-in" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Create New Goal</h3>
                <button onClick={() => setShowForm(false)}><X size={16} className="text-gray-500" /></button>
              </div>
              <input className="input-field" placeholder="Goal title (e.g. Exercise 3× per week)" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <input className="input-field" placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {GOAL_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Frequency</label>
                  <select className="input-field" value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">
                    Target: <span className="text-purple-400 font-medium">{form.targetValue} {form.unit}</span>
                  </label>
                  <input type="range" min="1" max="30" value={form.targetValue} onChange={e => setForm(p => ({ ...p, targetValue: Number(e.target.value) }))} className="w-full" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Unit</label>
                  <input className="input-field" placeholder="times, hours, pages…" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={createGoal} disabled={submitting} className="btn-primary flex-1 text-sm">
                  {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  Create Goal
                </button>
              </div>
            </div>
          )}

          {goals.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              <Target size={40} className="mx-auto mb-3 text-gray-700" />
              <p>No goals yet. Set one to start earning XP!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {goals.map(goal => {
                const cat = GOAL_CATEGORIES.find(c => c.id === goal.category) || GOAL_CATEGORIES[6];
                const pct = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
                return (
                  <div key={goal._id} className={`card ${goal.isCompleted ? 'border-emerald-500/30' : ''}`}
                    style={goal.isCompleted ? { background: 'rgba(16,185,129,0.04)' } : {}}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs" style={{ color: cat.color }}>{cat.label}</span>
                          <span className="text-xs text-gray-500 capitalize">{goal.frequency}</span>
                          {goal.isCompleted && (
                            <span className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">✅ Done!</span>
                          )}
                        </div>
                        <h3 className="font-medium text-sm">{goal.title}</h3>
                        {goal.description && <p className="text-xs text-gray-500 mt-0.5">{goal.description}</p>}
                      </div>
                      <button onClick={() => deleteGoal(goal._id)} className="text-gray-600 hover:text-rose-400 transition-colors p-1 flex-shrink-0">
                        <X size={14} />
                      </button>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-500">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                        <span style={{ color: cat.color }}>{Math.round(pct)}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: goal.isCompleted ? '#10b981' : cat.color }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-400 flex items-center gap-1">
                        <Zap size={10} /> +{goal.xpReward} XP on complete
                      </span>
                      {!goal.isCompleted && (
                        <div className="flex gap-2">
                          <button onClick={() => updateGoalProgress(goal, -1)}
                            className="px-2 py-1 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                            −
                          </button>
                          <button onClick={() => updateGoalProgress(goal, 1)}
                            className="px-3 py-1 rounded-lg text-sm font-medium transition-all hover:scale-105"
                            style={{ background: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}30` }}>
                            +1
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ACADEMIC TAB ── */}
      {activeTab === 'academic' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Academic Calendar</h2>
            <button onClick={() => setShowEventForm(true)} className="btn-primary text-sm px-4 py-2">
              <Plus size={16} /> Add Event
            </button>
          </div>

          {showEventForm && (
            <div className="card p-5 space-y-4 animate-scale-in" style={{ borderColor: 'rgba(6,182,212,0.2)' }}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Add Academic Event</h3>
                <button onClick={() => setShowEventForm(false)}><X size={16} className="text-gray-500" /></button>
              </div>
              <input className="input-field" placeholder="Event title (e.g. Data Structures Exam)" value={eventForm.title} onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <select className="input-field" value={eventForm.type} onChange={e => setEventForm(p => ({ ...p, type: e.target.value }))}>
                  {['exam', 'assignment', 'presentation', 'group_project', 'internship', 'lab', 'other'].map(t => (
                    <option key={t} value={t} className="capitalize">{t.replace('_', ' ')}</option>
                  ))}
                </select>
                <input className="input-field" placeholder="Subject" value={eventForm.subject} onChange={e => setEventForm(p => ({ ...p, subject: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Due Date & Time</label>
                <input type="datetime-local" className="input-field" value={eventForm.dueDate} onChange={e => setEventForm(p => ({ ...p, dueDate: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block">
                  Anticipated stress level: <span className="text-rose-400 font-medium">{eventForm.stressLevel}/10</span>
                </label>
                <input type="range" min="1" max="10" value={eventForm.stressLevel} onChange={e => setEventForm(p => ({ ...p, stressLevel: Number(e.target.value) }))} className="w-full" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowEventForm(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={createAcademicEvent} className="btn-primary flex-1 text-sm">Add Event</button>
              </div>
            </div>
          )}

          {academicEvents.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              <Calendar size={40} className="mx-auto mb-3 text-gray-700" />
              <p>No upcoming events. Add your exams and deadlines!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {academicEvents.map(event => {
                const days = getDaysUntil(event.dueDate);
                const urgency = days <= 1 ? '#f43f5e' : days <= 3 ? '#f59e0b' : days <= 7 ? '#06b6d4' : '#10b981';
                return (
                  <div key={event._id} className="card flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                      style={{ background: `${urgency}15`, border: `1px solid ${urgency}30` }}>
                      <span className="font-display font-bold text-lg" style={{ color: urgency }}>
                        {days <= 0 ? '!' : days}
                      </span>
                      <span className="text-xs text-gray-500">{days <= 0 ? 'Today' : 'days'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{event.title}</h3>
                      <div className="flex gap-2 mt-0.5 text-xs text-gray-500 flex-wrap">
                        <span className="capitalize">{event.type.replace('_', ' ')}</span>
                        {event.subject && <span>· {event.subject}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${event.stressLevel * 10}%`, background: urgency }} />
                        </div>
                        <span className="text-xs text-gray-600">Stress: {event.stressLevel}/10</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 text-right flex-shrink-0">
                      <div>{new Date(event.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</div>
                      <div>{new Date(event.dueDate).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── LEADERBOARD TAB ── */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm">Campus Wellness Leaders</h2>
          <p className="text-xs text-gray-500">Rankings based on XP from healthy habits — not mental health status.</p>
          {leaderboard.length === 0 ? (
            <div className="card text-center py-10 text-gray-500">No data yet. Start logging to appear here!</div>
          ) : leaderboard.map((u, i) => {
            const isMe = u._id === user?._id;
            const medals = ['🥇', '🥈', '🥉'];
            return (
              <div key={u._id} className={`card flex items-center gap-4 ${isMe ? 'border-purple-500/30' : ''}`}
                style={isMe ? { background: 'rgba(139,92,246,0.05)' } : {}}>
                <div className="w-8 text-center font-display font-bold" style={{ color: i < 3 ? '#f59e0b' : '#6b7280' }}>
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ background: isMe ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : 'rgba(255,255,255,0.05)' }}>
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm flex items-center gap-2">
                    <span className="truncate">{u.name}</span>
                    {isMe && <span className="badge bg-purple-500/20 text-purple-400 text-xs border border-purple-500/20 flex-shrink-0">You</span>}
                  </div>
                  <div className="text-xs text-gray-500">{u.university || 'Student'} · Level {u.wellness?.level || 1}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-purple-400">{u.wellness?.xp || 0}</div>
                  <div className="text-xs text-gray-600">XP</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── BADGES TAB ── */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          <h2 className="font-semibold text-sm">Badges & Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Earned badges */}
            {Object.entries(BADGE_INFO).map(([key, info]) => {
              const earned = user?.wellness?.badges?.includes(key);
              return (
                <div key={key}
                  className={`card text-center py-6 transition-all ${!earned ? 'opacity-40 grayscale' : ''}`}
                  style={earned ? { borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.04)' } : {}}>
                  <div className="text-4xl mb-2">{info.emoji}</div>
                  <div className="font-semibold text-sm">{info.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{info.desc}</div>
                  {earned && <div className="badge bg-amber-500/20 text-amber-400 border border-amber-500/30 mx-auto mt-2">Earned!</div>}
                </div>
              );
            })}
            {/* Locked badges */}
            {LOCKED_BADGES.map(b => (
              <div key={b.label} className="card text-center py-6 opacity-30 grayscale">
                <div className="text-4xl mb-2">{b.emoji}</div>
                <div className="font-semibold text-sm">{b.label}</div>
                <div className="text-xs text-gray-500 mt-1">{b.desc}</div>
                <div className="badge bg-gray-500/10 text-gray-500 mx-auto mt-2">Locked</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
