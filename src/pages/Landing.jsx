import { Link } from 'react-router-dom';
import { Heart, Brain, Shield, Zap, Users, BookOpen, Wind, Trophy,
         ArrowRight, Star, Mic, BarChart2, Calendar, Sparkles,
         CalendarClock, Bell, CheckCircle } from 'lucide-react';

const FEATURES = [
  { icon: Brain,        title: 'AI Companion (Mira)',         desc: 'Empathetic 24/7 AI mental health companion trained on student challenges — CBT, DBT, mindfulness approaches',  color: '#8b5cf6', badge: null },
  { icon: Heart,        title: 'Mood Tracker',                desc: 'Daily mood logs with sleep, academic load, physical symptoms, and tag correlations for deep self-awareness',    color: '#f43f5e', badge: null },
  { icon: Mic,          title: 'Voice Mood Analysis',         desc: 'Speak your feelings — AI analyses your words to detect emotional tone and automatically logs your mood',         color: '#ec4899', badge: 'NEW' },
  { icon: BookOpen,     title: 'Smart Journal',               desc: 'CBT thought journals, gratitude logs, daily reflections with AI-powered insights and coping strategy suggestions', color: '#06b6d4', badge: null },
  { icon: Wind,         title: 'Breathing & Meditation',      desc: '5 science-based breathing techniques with real-time animated guides plus daily mindfulness tips',               color: '#10b981', badge: null },
  { icon: Shield,       title: 'Crisis Detection & SOS',      desc: 'Intelligent keyword crisis detection with automatic counselor alerts and one-tap SOS emergency button',          color: '#f59e0b', badge: null },
  { icon: Users,        title: 'Anonymous Community',         desc: 'Safe peer support wall — vent anonymously, receive compassionate replies, react with support emojis',            color: '#a78bfa', badge: null },
  { icon: BarChart2,    title: 'Analytics Dashboard',         desc: 'Weekly/monthly mood trends, sleep correlation charts, academic load vs mood analysis, and stress insights',      color: '#34d399', badge: 'NEW' },
  { icon: Zap,          title: 'Stress Predictor',            desc: 'AI forecasts your stress risk based on upcoming deadlines, sleep, exercise, and recent mood patterns',           color: '#fb923c', badge: null },
  { icon: Calendar,     title: 'Counselor Booking',           desc: 'Browse and book 1-on-1 sessions with certified counselors via chat, video, or in-person consultation',           color: '#60a5fa', badge: 'NEW' },
  { icon: CalendarClock,title: 'Smart Routine Planner',       desc: 'AI generates a personalized daily schedule balancing study, sleep, exercise, mindfulness and breaks',             color: '#f472b6', badge: 'NEW' },
  { icon: Sparkles,     title: 'Personalized Recommendations',desc: 'AI-curated activities, resources and exercises based on your mood patterns, with weekly XP challenges',           color: '#fbbf24', badge: 'NEW' },
  { icon: Trophy,       title: 'Gamification & Badges',       desc: 'XP system, levels, daily streaks, and achievement badges to build lasting mental wellness habits',                color: '#34d399', badge: null },
  { icon: Bell,         title: 'Smart Notifications',         desc: 'Intelligent reminders for mood logging, meditation, study breaks and streak preservation — all timed smartly',  color: '#818cf8', badge: 'NEW' },
];

const STATS = [
  { value: '24/7', label: 'AI Support' },
  { value: '15+', label: 'Features' },
  { value: '100%', label: 'Private & Secure' },
  { value: '0₹', label: 'Free to Use' },
];

export default function Landing() {
  return (
    <div className="min-h-screen mesh-bg text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="font-display font-bold text-lg gradient-text">MindBridge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm px-4 py-2">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium text-purple-300"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <Star size={14} className="text-amber-400 fill-amber-400" />
            Built for Indian college students · v3.0 — 18+ Features
          </div>
          <h1 className="font-display font-bold text-5xl md:text-7xl leading-tight mb-6">
            Your Mental Health<br />
            <span className="gradient-text">Deserves Support</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            MindBridge is an AI-powered mental wellness platform for college students — AI chat companion, voice mood analysis, crisis detection, counselor booking, personalized routines, and much more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base px-8 py-4 flex items-center gap-2 justify-center">
              Start Your Journey Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-4">
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="glass rounded-2xl p-4 border border-white/5">
                <p className="font-display font-bold text-2xl gradient-text">{s.value}</p>
                <p className="text-gray-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              Everything You Need for <span className="gradient-text">Mental Wellness</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">A complete ecosystem of tools — from daily mood tracking to AI-powered crisis support</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="glass rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all group">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                    <f.icon size={18} style={{ color: f.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{f.title}</h3>
                      {f.badge && (
                        <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold"
                          style={{ background: `${f.color}20`, color: f.color, border: `1px solid ${f.color}40` }}>
                          {f.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl mb-12">How MindBridge Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', icon: '📝', title: 'Register & Set Up', desc: 'Create your account in 30 seconds. Add your university and preferences.' },
              { step: '2', icon: '❤️', title: 'Track Daily', desc: 'Log your mood, journal thoughts, do breathing exercises. Earn XP.' },
              { step: '3', icon: '🧠', title: 'Get AI Insights', desc: 'Mira analyses your patterns and gives personalized recommendations.' },
              { step: '4', icon: '📈', title: 'Grow & Heal', desc: 'Watch your wellness improve with streaks, badges, and counselor support.' },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl glass border border-purple-500/20 flex items-center justify-center text-2xl mb-3">{s.icon}</div>
                <p className="font-semibold text-sm mb-1">{s.title}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy assurance */}
      <section className="py-12 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <Shield size={32} className="mx-auto text-purple-400 mb-4" />
          <h2 className="font-display font-bold text-2xl mb-3">Your Privacy is Sacred</h2>
          <p className="text-gray-400 mb-6">All your data stays private. Journal entries are visible only to you. Community posts can be 100% anonymous. We never sell data to advertisers.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['JWT Authentication', 'Encrypted Passwords', '100% Anonymous Community', 'HTTPS Secured', 'No Data Selling'].map(item => (
              <div key={item} className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                <CheckCircle size={11} /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl mb-4">
            Start Your Wellness Journey Today
          </h2>
          <p className="text-gray-400 mb-8">Free. Private. Always here for you.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
            Get Started Free <ArrowRight size={18} />
          </Link>
          <p className="text-gray-600 text-xs mt-4">Not a replacement for professional therapy. Crisis line: iCall 9152987821</p>
        </div>
      </section>
    </div>
  );
}
