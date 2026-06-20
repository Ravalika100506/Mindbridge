import { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';
import { Bell, BellOff, Check, CheckCheck, Trash2, Calendar, Trophy, AlertTriangle, Heart, Wind, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const TYPE_CONFIG = {
  mood_reminder:      { icon: Heart,          color: 'text-pink-400',   bg: 'bg-pink-400/10',    border: 'border-pink-400/20' },
  meditation_reminder:{ icon: Wind,           color: 'text-emerald-400',bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  break_reminder:     { icon: Wind,           color: 'text-blue-400',   bg: 'bg-blue-400/10',    border: 'border-blue-400/20' },
  appointment:        { icon: Calendar,       color: 'text-purple-400', bg: 'bg-purple-400/10',  border: 'border-purple-400/20' },
  badge_earned:       { icon: Trophy,         color: 'text-amber-400',  bg: 'bg-amber-400/10',   border: 'border-amber-400/20' },
  crisis_support:     { icon: AlertTriangle,  color: 'text-red-400',    bg: 'bg-red-400/10',     border: 'border-red-400/20' },
  streak_milestone:   { icon: Flame,          color: 'text-orange-400', bg: 'bg-orange-400/10',  border: 'border-orange-400/20' },
  wellness_goal:      { icon: Trophy,         color: 'text-teal-400',   bg: 'bg-teal-400/10',    border: 'border-teal-400/20' },
};

const DEMO_NOTIFICATIONS = [
  { _id: 'n1', type: 'badge_earned', title: '🏅 Badge Unlocked!', message: "You earned the 'Week Warrior' badge for a 7-day streak!", isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: 'n2', type: 'mood_reminder', title: 'Daily Mood Check-in', message: "Don't forget to log your mood today to keep your streak going!", isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: 'n3', type: 'appointment', title: 'Appointment Confirmed ✅', message: 'Your session with Dr. Priya Sharma on tomorrow at 10:00 AM has been confirmed.', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: 'n4', type: 'streak_milestone', title: '🔥 3-Day Streak!', message: "You're on a 3-day mood logging streak. Keep it up!", isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { _id: 'n5', type: 'wellness_goal', title: 'Goal Progress', message: 'You completed your daily mindfulness goal! +20 XP earned.', isRead: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    API.get('/notifications').then(r => {
      setNotifications(r.data.data || []);
      setUnreadCount(r.data.unreadCount || 0);
    }).catch(() => {
      setNotifications(DEMO_NOTIFICATIONS);
      setUnreadCount(DEMO_NOTIFICATIONS.filter(n => !n.isRead).length);
    }).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* fail silently */ }
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed to update'); }
  };

  const deleteNotif = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      const n = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (!n?.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl flex items-center gap-3">
            <Bell size={24} className="text-purple-400" /> Notifications
            {unreadCount > 0 && <span className="text-sm font-normal bg-purple-500 text-white px-2.5 py-0.5 rounded-full">{unreadCount}</span>}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Reminders, milestones and updates</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-sm text-gray-300 hover:border-purple-500/30 transition-all">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-8 text-center text-gray-400">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <BellOff size={40} className="mx-auto text-gray-500 mb-3" />
          <p className="text-gray-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.mood_reminder;
            const Icon = cfg.icon;
            return (
              <div key={n._id} onClick={() => !n.isRead && markRead(n._id)}
                className={`glass rounded-2xl p-4 border transition-all cursor-pointer hover:bg-white/5 flex items-start gap-4 ${!n.isRead ? 'border-purple-500/20 bg-purple-500/5' : 'border-white/5'}`}>
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={16} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${!n.isRead ? 'text-white' : 'text-gray-300'}`}>{n.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />}
                      <button onClick={e => { e.stopPropagation(); deleteNotif(n._id); }}
                        className="text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-gray-500 text-xs mt-1.5">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
