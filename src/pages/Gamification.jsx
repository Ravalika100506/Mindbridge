import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import {
  Trophy, Star, Flame, Zap, Medal, Crown, Target, Award,
  TrendingUp, Users, Gift, ChevronRight, Lock, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const BADGE_CATALOG = [
  { id: 'first_mood',       icon: '🌟', name: 'First Step',         desc: 'Log your first mood',          xp: 10,  category: 'mood' },
  { id: 'mood_week',        icon: '🗓️', name: 'Week Warrior',        desc: '7 mood logs in a row',         xp: 30,  category: 'mood' },
  { id: 'mood_30',          icon: '🏅', name: 'Mood Master',         desc: '30 mood logs total',           xp: 60,  category: 'mood' },
  { id: 'zen_master',       icon: '🧘', name: 'Zen Master',          desc: '10 breathing sessions',        xp: 50,  category: 'wellness' },
  { id: 'journal_3',        icon: '📓', name: 'Scribe',              desc: 'Write 3 journal entries',      xp: 20,  category: 'journal' },
  { id: 'journal_10',       icon: '✍️', name: 'Deep Thinker',        desc: 'Write 10 journal entries',     xp: 50,  category: 'journal' },
  { id: 'chat_5',           icon: '💬', name: 'Conversations',       desc: 'Have 5 AI chat sessions',      xp: 25,  category: 'chat' },
  { id: 'streak_3',         icon: '🔥', name: 'On Fire',             desc: '3-day check-in streak',        xp: 15,  category: 'streak' },
  { id: 'streak_7',         icon: '⚡', name: 'Lightning Streak',    desc: '7-day check-in streak',        xp: 40,  category: 'streak' },
  { id: 'streak_30',        icon: '💎', name: 'Diamond Habit',       desc: '30-day check-in streak',       xp: 100, category: 'streak' },
  { id: 'community_post',   icon: '🤝', name: 'Community Hero',      desc: 'Post in community',            xp: 10,  category: 'social' },
  { id: 'goal_first',       icon: '🎯', name: 'Goal Setter',         desc: 'Complete a wellness goal',     xp: 20,  category: 'goals' },
  { id: 'goal_5',           icon: '🏆', name: 'Achiever',            desc: 'Complete 5 wellness goals',    xp: 75,  category: 'goals' },
  { id: 'crisis_safe',      icon: '🛡️', name: 'Safety First',        desc: 'Used crisis support',          xp: 5,   category: 'safety' },
  { id: 'level_5',          icon: '🚀', name: 'Rising Star',         desc: 'Reach level 5',                xp: 50,  category: 'level' },
  { id: 'level_10',         icon: '👑', name: 'Legend',              desc: 'Reach level 10',               xp: 150, category: 'level' },
];

const XP_ACTIONS = [
  { action: 'Log mood',              xp: 10,  icon: '💜' },
  { action: 'Write in journal',      xp: 15,  icon: '📓' },
  { action: 'Breathing session',     xp: 8,   icon: '🌬️' },
  { action: 'Chat with Mira (AI)',   xp: 5,   icon: '🤖' },
  { action: 'Community post',        xp: 5,   icon: '🤝' },
  { action: 'Complete a goal',       xp: 20,  icon: '🎯' },
  { action: 'Daily check-in streak', xp: 10,  icon: '🔥' },
  { action: 'Weekly challenge',      xp: 50,  icon: '⚡' },
];

const LEVELS = [1,2,3,4,5,6,7,8,9,10].map(l => ({ level: l, xpRequired: (l-1)*100, title: ['Newcomer','Explorer','Seeker','Grounded','Balanced','Resilient','Mindful','Enlightened','Champion','Legend'][l-1] }));

const categoryColor = {
  mood: 'from-pink-500 to-rose-500',
  wellness: 'from-teal-500 to-emerald-500',
  journal: 'from-blue-500 to-indigo-500',
  chat: 'from-violet-500 to-purple-500',
  streak: 'from-amber-500 to-orange-500',
  social: 'from-cyan-500 to-sky-500',
  goals: 'from-lime-500 to-green-500',
  safety: 'from-red-400 to-rose-600',
  level: 'from-yellow-400 to-amber-500',
};

export default function Gamification() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLB, setLoadingLB] = useState(true);
  const [tab, setTab] = useState('overview');

  const wellness = user?.wellness || { xp: 0, level: 1, streak: 0, badges: [], totalMoodLogs: 0, totalJournals: 0, totalBreathingSessions: 0 };
  const earnedBadges = new Set(wellness.badges || []);
  const levelProgress = wellness.xp % 100;
  const currentLevel = LEVELS.find(l => l.level === (wellness.level || 1)) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === (wellness.level || 1) + 1);

  useEffect(() => {
    API.get('/wellness/leaderboard')
      .then(r => setLeaderboard(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingLB(false));
  }, []);

  const tabs = [
    { id: 'overview',    label: 'Overview',    icon: Star },
    { id: 'badges',      label: 'Badges',      icon: Medal },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'how',         label: 'Earn XP',     icon: Zap },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border border-white/10">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <Trophy className="text-amber-400" size={26} /> Gamification Hub
            </h1>
            <p className="text-gray-400 mt-1">Track your progress, earn badges, and compete with peers</p>
          </div>
          {/* XP Card */}
          <div className="glass rounded-xl p-4 border border-amber-500/20 min-w-[200px]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl font-bold text-black">
                {wellness.level || 1}
              </div>
              <div>
                <p className="text-sm text-amber-400 font-semibold">{currentLevel.title}</p>
                <p className="text-xs text-gray-400">{wellness.xp || 0} total XP</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{levelProgress} / 100 XP</span>
                {nextLevel && <span>→ {nextLevel.title}</span>}
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div initial={{ width: 0 }} animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Streak', value: `${wellness.streak || 0}d`, icon: Flame, color: 'text-orange-400' },
            { label: 'Badges', value: earnedBadges.size, icon: Award, color: 'text-purple-400' },
            { label: 'Mood Logs', value: wellness.totalMoodLogs || 0, icon: Target, color: 'text-pink-400' },
            { label: 'Sessions', value: wellness.totalBreathingSessions || 0, icon: Zap, color: 'text-teal-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass rounded-xl p-3 border border-white/5 text-center">
              <Icon size={18} className={`${color} mx-auto mb-1`} />
              <p className="text-lg font-bold">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              tab === id ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'glass text-gray-400 hover:text-white border border-white/5'
            }`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="space-y-4">
              {/* Level progress map */}
              <div className="glass rounded-2xl p-5 border border-white/10">
                <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><TrendingUp size={14} /> Level Journey</h3>
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {LEVELS.map((l, i) => {
                    const done = (wellness.level || 1) > l.level;
                    const current = (wellness.level || 1) === l.level;
                    return (
                      <div key={l.level} className="flex items-center">
                        <div className={`flex flex-col items-center gap-1 ${current ? 'scale-110' : ''}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                            done ? 'bg-amber-500 border-amber-400 text-black' :
                            current ? 'bg-purple-500/30 border-purple-400 text-purple-300 animate-pulse' :
                            'bg-white/5 border-white/10 text-gray-600'
                          }`}>
                            {done ? '✓' : l.level}
                          </div>
                          <span className="text-[9px] text-gray-600 whitespace-nowrap">{l.title}</span>
                        </div>
                        {i < LEVELS.length - 1 && (
                          <div className={`w-6 h-0.5 mx-0.5 ${done ? 'bg-amber-500' : 'bg-white/10'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent badges */}
              <div className="glass rounded-2xl p-5 border border-white/10">
                <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Medal size={14} /> Your Badges</h3>
                {earnedBadges.size === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Award size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No badges yet — start logging moods and journaling!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {BADGE_CATALOG.filter(b => earnedBadges.has(b.id)).map(badge => (
                      <motion.div key={badge.id} whileHover={{ scale: 1.08 }}
                        className={`glass rounded-xl p-3 text-center border border-white/10 bg-gradient-to-br ${categoryColor[badge.category]}/10`}>
                        <div className="text-2xl mb-1">{badge.icon}</div>
                        <p className="text-xs font-semibold text-white truncate">{badge.name}</p>
                        <p className="text-[10px] text-amber-400">+{badge.xp} XP</p>
                      </motion.div>
                    ))}
                  </div>
                )}
                <button onClick={() => setTab('badges')} className="mt-3 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  View all badges <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* BADGES */}
          {tab === 'badges' && (
            <div className="glass rounded-2xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Badge Collection</h3>
                <span className="text-xs text-gray-500">{earnedBadges.size} / {BADGE_CATALOG.length} earned</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BADGE_CATALOG.map(badge => {
                  const earned = earnedBadges.has(badge.id);
                  return (
                    <motion.div key={badge.id} whileHover={{ scale: 1.02 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        earned ? `bg-gradient-to-r ${categoryColor[badge.category]}/10 border-white/15` : 'bg-white/2 border-white/5 opacity-50'
                      }`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                        earned ? `bg-gradient-to-br ${categoryColor[badge.category]}/20` : 'bg-white/5'
                      }`}>
                        {earned ? badge.icon : <Lock size={18} className="text-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{badge.name}</p>
                          {earned && <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500">{badge.desc}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0 ${
                        earned ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-gray-600'
                      }`}>+{badge.xp} XP</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* LEADERBOARD */}
          {tab === 'leaderboard' && (
            <div className="glass rounded-2xl p-5 border border-white/10">
              <h3 className="font-semibold mb-1 flex items-center gap-2"><Crown size={16} className="text-amber-400" /> Top Students</h3>
              <p className="text-xs text-gray-500 mb-4">Rankings based on total XP earned through wellness activities</p>
              {loadingLB ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((u, idx) => {
                    const isMe = u._id === user?._id;
                    const rankEmoji = ['🥇','🥈','🥉'][idx] || `#${idx+1}`;
                    return (
                      <motion.div key={u._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isMe ? 'bg-purple-500/15 border-purple-500/30' : 'bg-white/3 border-white/5'
                        }`}>
                        <span className="text-xl w-8 text-center flex-shrink-0">{rankEmoji}</span>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {u.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{u.name} {isMe && <span className="text-purple-400 text-xs">(you)</span>}</p>
                          <p className="text-xs text-gray-500">Lv {u.wellness?.level || 1} · {u.university || 'Student'}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-amber-400">{u.wellness?.xp || 0} XP</p>
                          <p className="text-xs text-orange-400 flex items-center gap-0.5 justify-end">
                            <Flame size={10} /> {u.wellness?.streak || 0}d
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  {leaderboard.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No data yet. Be the first to earn XP!</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* HOW TO EARN XP */}
          {tab === 'how' && (
            <div className="glass rounded-2xl p-5 border border-white/10">
              <h3 className="font-semibold mb-1 flex items-center gap-2"><Zap size={16} className="text-yellow-400" /> How to Earn XP</h3>
              <p className="text-xs text-gray-500 mb-4">Complete these activities to level up and unlock badges</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {XP_ACTIONS.map(({ action, xp, icon }) => (
                  <div key={action} className="flex items-center gap-3 p-3 glass rounded-xl border border-white/5">
                    <span className="text-xl flex-shrink-0">{icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{action}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-400 flex-shrink-0">+{xp} XP</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <p className="text-xs text-purple-300">
                  <Gift size={12} className="inline mr-1" />
                  <strong>Pro tip:</strong> Maintain a daily streak for bonus XP and unlock exclusive streak badges!
                </p>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
