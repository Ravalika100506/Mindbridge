import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Heart, BookOpen, Wind, MessageCircle, Users,
  BookMarked, Trophy, User, AlertTriangle, LogOut, Menu, X,
  Flame, Calendar, Sparkles, Bell, BarChart2, CalendarClock,
  Mic, Brain, Shield, GamepadIcon, MessagesSquare, Atom
} from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { API } from '../../context/AuthContext';

const NAV_MAIN = [
  { path: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard'          },
  { path: '/mood',            icon: Heart,            label: 'Mood Tracker'       },
  { path: '/voice',           icon: Mic,              label: 'Voice Mood',   badge: '🎙️' },
  { path: '/emotion',         icon: Atom,             label: 'Emotion Detect', badge: 'NLP' },
  { path: '/journal',         icon: BookOpen,         label: 'Journal'            },
  { path: '/breathe',         icon: Wind,             label: 'Breathe'            },
  { path: '/chat',            icon: MessageCircle,    label: 'AI Companion', badge: 'AI' },
  { path: '/peer-chat',       icon: MessagesSquare,   label: 'Peer Chat',    badge: '💬' },
  { path: '/community',       icon: Users,            label: 'Community'          },
  { path: '/resources',       icon: BookMarked,       label: 'Resources'          },
];

const NAV_INSIGHTS = [
  { path: '/analytics',       icon: BarChart2,        label: 'Analytics'          },
  { path: '/stress',          icon: Brain,            label: 'Stress Predictor'   },
  { path: '/recommendations', icon: Sparkles,         label: 'For You',      badge: '✨' },
  { path: '/routine',         icon: CalendarClock,    label: 'Routine Planner'    },
  { path: '/gamification',    icon: Trophy,           label: 'Gamification', badge: '🏆' },
];

const NAV_SUPPORT = [
  { path: '/appointments',    icon: Calendar,         label: 'Appointments'       },
  { path: '/wellness',        icon: Trophy,           label: 'Wellness Goals'     },
  { path: '/profile',         icon: User,             label: 'Profile'            },
];

function NavSection({ title, items, onClick }) {
  return (
    <div className="mb-1">
      {title && <p className="px-3 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wider">{title}</p>}
      {items.map(({ path, icon: Icon, label, badge }) => (
        <NavLink key={path} to={path} onClick={onClick}
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
            ${isActive
              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
          `}>
          <Icon size={15} className="flex-shrink-0" />
          <span className="flex-1">{label}</span>
          {badge && (
            <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-md border border-purple-500/20">
              {badge}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const isStaff = user?.role === 'counselor' || user?.role === 'admin';

  useEffect(() => {
    const token = localStorage.getItem('mb_token');
    if (!token) return;

    API.get('/notifications').then(r => setUnreadNotifs(r.data.unreadCount || 0)).catch(() => {});

    const socket = io('/', {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 3,
    });

    socket.on('connect_error', () => {});
    socket.on('online_count', (count) => setOnlineCount(count));
    socket.on('crisis:alert', (data) => {
      if (isStaff) toast.error(`🚨 SOS Alert from ${data.userName}!`, { duration: 10000 });
    });
    socket.on('notification:new', () => setUnreadNotifs(p => p + 1));

    return () => socket.disconnect();
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); toast.success('Logged out safely 👋'); };
  const close = () => setSidebarOpen(false);
  const levelProgress = (user?.wellness?.xp || 0) % 100;

  return (
    <div className="flex h-screen overflow-hidden mesh-bg">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={close} />}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-68 flex flex-col
        glass border-r border-white/5 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{ width: '268px' }}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">🧠</div>
            <span className="font-display font-bold text-lg">MindBridge</span>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={close}><X size={18} /></button>
        </div>

        {/* User card */}
        <div className="px-3 py-3 border-b border-white/5 flex-shrink-0">
          <div className="glass rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name || 'Student'}</p>
                <p className="text-xs text-gray-500">Lv {user?.wellness?.level || 1} · {user?.wellness?.xp || 0} XP</p>
              </div>
              {(user?.wellness?.streak || 0) > 0 && (
                <div className="flex items-center gap-1 text-amber-400 text-xs flex-shrink-0">
                  <Flame size={11} /> {user.wellness.streak}
                </div>
              )}
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all" style={{ width: `${levelProgress}%` }} />
            </div>
          </div>
          {onlineCount > 0 && (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 mt-2 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {onlineCount} student{onlineCount !== 1 ? 's' : ''} online
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-2 scrollbar-thin">
          <NavSection items={NAV_MAIN} onClick={close} />
          <NavSection title="Insights" items={NAV_INSIGHTS} onClick={close} />
          <NavSection title="Support" items={NAV_SUPPORT} onClick={close} />

          {/* Staff-only admin link */}
          {isStaff && (
            <NavSection title="Staff" items={[{ path: '/admin', icon: Shield, label: 'Admin Dashboard', badge: '🛡️' }]} onClick={close} />
          )}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-2 border-t border-white/5 space-y-0.5 flex-shrink-0">
          <NavLink to="/notifications" onClick={close}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${isActive ? 'bg-purple-500/15 text-purple-300 border-purple-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'}`}>
            <Bell size={15} />
            <span className="flex-1">Notifications</span>
            {unreadNotifs > 0 && (
              <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{unreadNotifs > 9 ? '9+' : unreadNotifs}</span>
            )}
          </NavLink>
          <NavLink to="/crisis" onClick={close}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${isActive ? 'bg-red-500/15 text-red-300 border-red-500/20' : 'text-red-400/70 hover:text-red-400 hover:bg-red-500/5 border-transparent'}`}>
            <AlertTriangle size={15} /><span>Crisis Support</span>
          </NavLink>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all">
            <LogOut size={15} /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 glass flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white"><Menu size={22} /></button>
          <span className="font-display font-bold">MindBridge</span>
          <NavLink to="/notifications" className="relative text-gray-400 hover:text-white">
            <Bell size={20} />
            {unreadNotifs > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">{unreadNotifs}</span>}
          </NavLink>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
