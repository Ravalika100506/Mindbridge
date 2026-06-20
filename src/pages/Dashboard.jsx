import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Heart, BookOpen, Wind, MessageCircle, Flame, Zap, Star, ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const MOOD_OPTIONS = [
  { v: [1,2],   emoji: '😔', label: 'Struggling', color: '#f43f5e' },
  { v: [3,4],   emoji: '😕', label: 'Low',         color: '#fb923c' },
  { v: [5,6],   emoji: '😐', label: 'Neutral',     color: '#facc15' },
  { v: [7,8],   emoji: '🙂', label: 'Good',         color: '#4ade80' },
  { v: [9,10],  emoji: '😄', label: 'Great',        color: '#34d399' },
];
const getMoodInfo = (s) => MOOD_OPTIONS.find(m => s >= m.v[0] && s <= m.v[1]) || MOOD_OPTIONS[2];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const info = getMoodInfo(payload[0].value);
    return (
      <div className="glass rounded-xl p-3 text-xs border border-white/10">
        <p className="text-gray-400 mb-1">{label}</p>
        <p className="font-semibold" style={{ color: info.color }}>
          {info.emoji} {payload[0].value}/10
        </p>
      </div>
    );
  }
  return null;
};

const QUOTES = [
  "You don't have to have it all figured out to move forward.",
  "Rest if you must, but don't quit.",
  "Every day may not be good, but there is something good in every day.",
  "Your mental health is a priority. Your happiness is essential.",
  "It's okay not to be okay. What matters is you keep going.",
  "Small steps every day still count as progress.",
];

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentMoods, setRecentMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    Promise.all([
      API.get('/mood/analytics?days=14'),
      API.get('/mood?days=7&limit=20')
    ]).then(([analyticsRes, moodsRes]) => {
      setAnalytics(analyticsRes.data.data || null);
      setRecentMoods([...(moodsRes.data.data || [])].reverse());
    }).catch(() => {
      // Backend not connected yet — fail gracefully
    }).finally(() => setLoading(false));
  }, []);

  const latestMood = recentMoods.length ? recentMoods[recentMoods.length - 1] : null;
  const moodInfo = latestMood ? getMoodInfo(latestMood.mood) : null;

  const quickActions = [
    { to: '/mood',    icon: Heart,          label: 'Log Mood',        color: '#f43f5e', xp: '+10 XP' },
    { to: '/journal', icon: BookOpen,       label: 'Write Journal',   color: '#06b6d4', xp: '+15 XP' },
    { to: '/breathe', icon: Wind,           label: 'Breathe',          color: '#10b981', xp: '+8 XP'  },
    { to: '/chat',    icon: MessageCircle,  label: 'Talk to Mira',    color: '#8b5cf6', xp: 'AI'      },
  ];

  const chartData = analytics?.moodTrend?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    mood: Math.round(d.avgMood * 10) / 10
  })) || [];

  const levelProgress = (user?.wellness?.xp || 0) % 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl">
            Hey {user?.name?.split(' ')[0] || 'there'} {moodInfo?.emoji || '👋'}
          </h1>
          <p className="text-gray-400 mt-1 text-sm italic">"{quote}"</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {(user?.wellness?.streak || 0) > 0 && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <Flame className="text-amber-400" size={18} />
              <span className="text-sm font-bold text-amber-400">
                {user.wellness.streak} day streak!
              </span>
            </div>
          )}
          <Link to="/mood" className="btn-primary text-sm px-4 py-2">
            Log Today <Heart size={14} />
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Level',    value: user?.wellness?.level || 1,                         icon: Star,    color: '#8b5cf6', sub: `${user?.wellness?.xp || 0} XP`      },
          { label: 'Streak',   value: `${user?.wellness?.streak || 0}d`,                  icon: Flame,   color: '#f59e0b', sub: 'Keep going!'                         },
          { label: 'Avg Mood', value: analytics?.avgMood ? `${analytics.avgMood}/10` : '—', icon: Heart, color: '#f43f5e', sub: '14-day avg'                          },
          { label: 'Journals', value: user?.wellness?.totalJournals || 0,                  icon: BookOpen,color: '#06b6d4', sub: 'Total entries'                       },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">{label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <div className="font-display font-bold text-2xl mt-1" style={{ color }}>{value}</div>
            <div className="text-xs text-gray-600">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Mood Chart */}
        <div className="md:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-sm">Mood Trend (14 days)</h2>
            <Link to="/mood" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="h-44 skeleton rounded-xl" />
          ) : chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[1, 10]} tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={2.5}
                  fill="url(#moodGrad)" dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center flex-col gap-2 text-gray-600">
              <Heart size={32} className="text-gray-700" />
              <p className="text-sm">Start logging your mood to see trends!</p>
              <Link to="/mood" className="btn-primary text-xs px-4 py-2 mt-1">Log First Mood</Link>
            </div>
          )}
        </div>

        {/* Wellness Card */}
        <div className="card flex flex-col gap-4">
          <h2 className="font-semibold text-sm">Your Wellness</h2>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-400">XP Progress</span>
                <span className="text-purple-400">{levelProgress}/100</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${levelProgress}%`, background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="text-lg font-bold text-cyan-400">{user?.wellness?.totalMoodLogs || 0}</div>
                <div className="text-xs text-gray-500">Mood Logs</div>
              </div>
              <div className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="text-lg font-bold text-emerald-400">{user?.wellness?.totalBreathingSessions || 0}</div>
                <div className="text-xs text-gray-500">Breathe</div>
              </div>
            </div>

            {user?.wellness?.badges?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Badges</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.wellness.badges.map(b => (
                    <span key={b} className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
                      {b === 'week_warrior' ? '🏆 Week Warrior'
                        : b === 'mood_master' ? '❤️ Mood Master'
                        : b === 'zen_master' ? '🧘 Zen Master'
                        : b}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-semibold text-xs mb-4 text-gray-400 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map(({ to, icon: Icon, label, color, xp }) => (
            <Link key={to} to={to} className="card glass-hover flex flex-col items-center gap-3 py-6 text-center group">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: `${color}15`, border: `1px solid ${color}20` }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <span className="font-medium text-sm">{label}</span>
              <span className="text-xs" style={{ color }}>{xp}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Insight */}
      {analytics && Object.keys(analytics).length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(6,182,212,0.15)' }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(6,182,212,0.1)' }}>
              <TrendingUp size={20} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Weekly Insight</h3>
              <p className="text-gray-400 text-sm">
                Your average sleep is{' '}
                <span className="text-cyan-400 font-medium">{analytics.avgSleep || 7}h</span>{' '}
                and you exercised{' '}
                <span className="text-emerald-400 font-medium">{analytics.exerciseDays || 0} days</span>{' '}
                this period.
                {analytics.avgMood >= 7
                  ? " You're doing great — keep building those habits! 🌟"
                  : analytics.avgMood >= 5
                    ? " Consistent self-care can really help lift your mood. 💙"
                    : " Consider reaching out to someone you trust. You don't have to face this alone. 💜"}
              </p>
              {analytics.topTags?.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {analytics.topTags.map(([tag]) => (
                    <span key={tag} className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Crisis warning */}
      {user?.crisisFlag && (
        <div className="card" style={{ borderColor: 'rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.05)' }}>
          <div className="flex items-center gap-4">
            <AlertTriangle className="text-rose-400 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h3 className="font-semibold text-rose-300 text-sm mb-1">You're In Our Hearts</h3>
              <p className="text-gray-400 text-xs">
                We noticed you might be going through a tough time. A counselor has been notified.
                Please reach out — help is available.
              </p>
            </div>
            <Link to="/crisis" className="btn-primary text-xs px-4 py-2 flex-shrink-0">Get Help</Link>
          </div>
        </div>
      )}
    </div>
  );
}
