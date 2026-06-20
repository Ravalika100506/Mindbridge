import { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';
import { Phone, Moon, BookOpen, Heart, Users, Brain, Search, X, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const CATEGORY_META = {
  crisis:      { label: '🆘 Crisis',       color: '#f43f5e', icon: Phone    },
  anxiety:     { label: '😮‍💨 Anxiety',    color: '#f59e0b', icon: Brain    },
  sleep:       { label: '😴 Sleep',         color: '#8b5cf6', icon: Moon     },
  academic:    { label: '📚 Academic',      color: '#06b6d4', icon: BookOpen },
  mindfulness: { label: '🧘 Mindfulness',   color: '#10b981', icon: Heart    },
  social:      { label: '👥 Social',        color: '#ec4899', icon: Users    },
  cbt:         { label: '🧠 CBT Tools',     color: '#a78bfa', icon: Brain    },
};

const QUICK_TECHNIQUES = [
  { title: '54321 Grounding', emoji: '🧊', color: '#06b6d4', desc: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Works immediately for anxiety and panic.' },
  { title: 'TIPP Skill', emoji: '🌡️', color: '#8b5cf6', desc: 'Temperature (cold water on face), Intense exercise, Paced breathing, Progressive relaxation — for overwhelming emotions.' },
  { title: 'STOP Technique', emoji: '🛑', color: '#10b981', desc: "Stop what you're doing. Take a breath. Observe your thoughts without judgment. Proceed mindfully." },
  { title: 'DEAR MAN (DBT)', emoji: '💬', color: '#f59e0b', desc: 'Describe, Express, Assert, Reinforce, Mindful, Appear confident, Negotiate — for difficult conversations.' },
];

const MINDFULNESS_TIPS = [
  { title: 'Morning Intention', emoji: '🌅', tip: "Before checking your phone, take 3 deep breaths and set one small intention for the day." },
  { title: 'Mindful Eating', emoji: '🍱', tip: "Eat at least one meal today without screens. Notice flavours, textures, temperature." },
  { title: 'Study Mindfulness', emoji: '📖', tip: "Every 25 minutes, pause and do a quick body scan — notice tension in shoulders, jaw, or hands." },
  { title: 'Gratitude Pause', emoji: '🙏', tip: "Before sleep, name 3 things that went okay today. Even small things count." },
  { title: 'Walking Meditation', emoji: '🚶', tip: "On your next walk to class, leave earbuds out. Notice sounds, sights, sensations under your feet." },
  { title: 'Breath Anchor', emoji: '⚓', tip: "When stress spikes, place a hand on your belly. Feel it rise and fall 5 times. That's it." },
];

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const url = category !== 'all' ? `/resources?category=${category}` : '/resources';
    setLoading(true);
    API.get(url).then(r => setResources(r.data.data || [])).catch(() => setResources([])).finally(() => setLoading(false));
  }, [category]);

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id);

  const filtered = search.trim()
    ? resources.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase())
      )
    : resources;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl">Resources & Support</h1>
        <p className="text-gray-400 text-sm mt-1">Evidence-based tools, guides, and helplines for student wellbeing</p>
      </div>

      {/* Emergency Banner */}
      <div className="p-4 rounded-2xl flex items-center gap-4" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.1), rgba(245,158,11,0.05))', border: '1px solid rgba(244,63,94,0.2)' }}>
        <span className="text-3xl flex-shrink-0">🚨</span>
        <div className="flex-1">
          <p className="font-semibold text-rose-300 text-sm">In crisis right now?</p>
          <p className="text-gray-400 text-xs mt-0.5">iCall (free, Mon–Sat): <strong className="text-rose-300">9152987821</strong> · Vandrevala (24/7): <strong className="text-rose-300">1860-2662-345</strong></p>
        </div>
        <a href="tel:9152987821" className="btn-primary text-xs px-4 py-2 flex-shrink-0 flex items-center gap-1.5">
          <Phone size={12} /> Call Now
        </a>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search resources, techniques, guides..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-10 py-3.5 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category pills */}
      {!search && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCategory('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium border transition-all ${category === 'all' ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
            All
          </button>
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <button key={key} onClick={() => setCategory(key)}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium border transition-all ${category === key ? 'border-opacity-50 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'}`}
              style={category === key ? { background: `${meta.color}20`, borderColor: `${meta.color}50`, color: meta.color } : {}}>
              {meta.label}
            </button>
          ))}
        </div>
      )}

      {/* Quick mindfulness tips */}
      {(category === 'all' || category === 'mindfulness') && !search && (
        <div className="glass rounded-2xl p-5 border border-emerald-500/10">
          <h2 className="font-semibold text-sm text-emerald-300 mb-4">🧘 Daily Mindfulness Tips</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {MINDFULNESS_TIPS.map((tip, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-all">
                <span className="text-xl flex-shrink-0">{tip.emoji}</span>
                <div>
                  <p className="text-sm font-medium">{tip.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{tip.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick techniques */}
      {(category === 'all' || category === 'anxiety' || category === 'cbt') && !search && (
        <div>
          <h2 className="font-semibold text-sm text-gray-300 mb-3">⚡ Quick Techniques</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {QUICK_TECHNIQUES.filter(t =>
              category === 'all' || category === 'anxiety' ||
              (category === 'cbt' && t.title.includes('DEAR'))
            ).map(t => (
              <div key={t.title} className="glass rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{t.emoji}</span>
                  <p className="font-semibold text-sm" style={{ color: t.color }}>{t.title}</p>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main resource list */}
      <div>
        <h2 className="font-semibold text-sm text-gray-300 mb-3">
          {search ? `Search results for "${search}"` : 'Resource Library'}
          {filtered.length > 0 && <span className="text-gray-500 font-normal ml-2">({filtered.length})</span>}
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="glass rounded-2xl h-16 animate-pulse border border-white/5" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <Search size={32} className="mx-auto text-gray-500 mb-2" />
            <p className="text-gray-400">No resources found{search ? ` for "${search}"` : ''}.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(r => {
              const meta = CATEGORY_META[r.category] || {};
              const isOpen = expanded === r.id;
              return (
                <div key={r.id} className="glass rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
                  <button onClick={() => toggleExpand(r.id)} className="w-full flex items-center gap-4 p-4 text-left">
                    <span className="text-2xl flex-shrink-0">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{r.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: `${meta.color}15`, color: meta.color }}>
                          {r.category} · {r.type}
                        </span>
                        {r.duration && <span className="text-gray-500 text-xs">{r.duration}</span>}
                        {r.contact && <span className="text-rose-400 text-xs font-bold">{r.contact}</span>}
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-white/5 pt-3 animate-fade-in">
                      <p className="text-gray-400 text-sm mb-3">{r.description}</p>
                      {r.steps && (
                        <ol className="space-y-1.5">
                          {r.steps.map((s, i) => (
                            <li key={i} className="flex gap-2 text-sm text-gray-300">
                              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i+1}</span>
                              {s}
                            </li>
                          ))}
                        </ol>
                      )}
                      {r.tips && (
                        <ul className="space-y-1.5">
                          {r.tips.map((tip, i) => (
                            <li key={i} className="flex gap-2 text-sm text-gray-300">
                              <span className="text-purple-400 mt-0.5">•</span>{tip}
                            </li>
                          ))}
                        </ul>
                      )}
                      {r.contact && (
                        <a href={`tel:${r.contact.replace(/-/g, '')}`}
                          className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition-all">
                          <Phone size={13} /> Call {r.contact}
                        </a>
                      )}
                      {r.language && <p className="text-gray-500 text-xs mt-2">🌐 Available in: {r.language}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
