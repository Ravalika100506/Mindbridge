import { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';
import { BookOpen, Plus, Sparkles, Trash2, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const JOURNAL_TYPES = [
  { id: 'free_write',       label: '✍️ Free Write',        desc: 'Write anything on your mind'         },
  { id: 'gratitude',        label: '🙏 Gratitude',         desc: '3 things you are grateful for'        },
  { id: 'cbt_thought',      label: '🧠 CBT Journal',       desc: 'Challenge negative thoughts'          },
  { id: 'daily_reflection', label: '🌙 Daily Reflection',  desc: 'End-of-day check-in'                  },
  { id: 'vent',             label: '💨 Vent Space',         desc: 'Safe space to let it all out'         },
  { id: 'goal_setting',     label: '🎯 Goal Setting',      desc: 'Set intentions and goals'             },
];

const CBT_DISTORTIONS = [
  'All-or-nothing thinking', 'Catastrophizing', 'Mind reading',
  'Fortune telling', 'Emotional reasoning', 'Should statements',
  'Personalization', 'Overgeneralization'
];

const BLANK_CBT = {
  situation: '', automaticThought: '', emotion: '',
  cognitiveDistortion: '', balancedThought: ''
};

export default function Journal() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('free_write');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(5);
  const [gratitudeItems, setGratitudeItems] = useState(['', '', '']);
  const [cbt, setCbt] = useState(BLANK_CBT);
  const [isPrivate, setIsPrivate] = useState(true);
  const [aiInsight, setAiInsight] = useState(null);
  const [gettingInsight, setGettingInsight] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);

  const fetchJournals = async () => {
    try {
      const res = await API.get('/journal?limit=40');
      setJournals(res.data.data || []);
    } catch {
      toast.error('Failed to load journals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJournals(); }, []);

  const resetForm = () => {
    setType('free_write');
    setTitle('');
    setContent('');
    setMood(5);
    setGratitudeItems(['', '', '']);
    setCbt(BLANK_CBT);
    setIsPrivate(true);
    setAiInsight(null);
  };

  const closeForm = () => { setShowForm(false); resetForm(); };

  const getAIInsight = async () => {
    const text = type === 'gratitude'
      ? gratitudeItems.filter(Boolean).join('. ')
      : type === 'cbt_thought'
        ? Object.values(cbt).filter(Boolean).join('. ')
        : content;

    if (!text.trim()) return toast.error('Write something first!');
    setGettingInsight(true);
    try {
      const res = await API.post('/ai/analyze-journal', { content: text, type });
      setAiInsight(res.data.data);
    } catch {
      toast.error('AI insight unavailable. Please try again.');
    } finally {
      setGettingInsight(false);
    }
  };

  const handleSubmit = async () => {
    let finalContent = content;

    if (type === 'gratitude') {
      const items = gratitudeItems.filter(Boolean);
      if (!items.length) return toast.error('Add at least one thing you\'re grateful for!');
      finalContent = `I'm grateful for:\n${items.map((it, i) => `${i + 1}. ${it}`).join('\n')}`;
    } else if (type === 'cbt_thought') {
      if (!cbt.situation && !cbt.automaticThought) return toast.error('Fill in the situation or thought.');
      finalContent = [
        cbt.situation && `Situation: ${cbt.situation}`,
        cbt.automaticThought && `Automatic Thought: ${cbt.automaticThought}`,
        cbt.emotion && `Emotion: ${cbt.emotion}`,
        cbt.cognitiveDistortion && `Distortion: ${cbt.cognitiveDistortion}`,
        cbt.balancedThought && `Balanced Thought: ${cbt.balancedThought}`,
        content && `Notes: ${content}`
      ].filter(Boolean).join('\n');
    } else {
      if (!content.trim()) return toast.error('Please write something first!');
    }

    setSubmitting(true);
    try {
      await API.post('/journal', {
        title: title.trim() || `${JOURNAL_TYPES.find(t => t.id === type)?.label} — ${new Date().toLocaleDateString()}`,
        content: finalContent,
        mood, type, isPrivate,
        cbt: type === 'cbt_thought' ? cbt : undefined,
        gratitudeItems: type === 'gratitude' ? gratitudeItems.filter(Boolean) : undefined,
        tags: type === 'cbt_thought' ? ['cbt'] : type === 'gratitude' ? ['gratitude'] : [],
        aiInsight: aiInsight?.insight || ''
      });
      toast.success('Journal saved! +15 XP 📖');
      closeForm();
      fetchJournals();
    } catch {
      toast.error('Failed to save journal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteJournal = async (id) => {
    if (!window.confirm('Delete this journal entry? This cannot be undone.')) return;
    try {
      await API.delete(`/journal/${id}`);
      setJournals(prev => prev.filter(j => j._id !== id));
      setSelectedJournal(null);
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const typeInfo = (id) => JOURNAL_TYPES.find(t => t.id === id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">My Journal</h1>
          <p className="text-gray-400 text-sm mt-1">Private, safe space for your thoughts</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={18} /> New Entry
        </button>
      </div>

      {/* ── New Entry Modal ── */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeForm}
        >
          <div
            className="w-full max-w-2xl my-4 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-lg">New Journal Entry</h2>
                <button onClick={closeForm} className="text-gray-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Type Selector */}
              <div className="grid grid-cols-3 gap-2">
                {JOURNAL_TYPES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setType(t.id); setAiInsight(null); }}
                    className={`p-3 rounded-xl text-left text-xs transition-all ${
                      type === t.id
                        ? 'bg-purple-500/20 border border-purple-500/30'
                        : 'bg-white/3 border border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="font-medium mb-0.5">{t.label}</div>
                    <div className="text-gray-500">{t.desc}</div>
                  </button>
                ))}
              </div>

              {/* Title */}
              <input
                className="input-field"
                placeholder="Title (optional)"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />

              {/* Mood */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">
                  Current mood: <span className="text-purple-400 font-medium">{mood}/10</span>
                </label>
                <input type="range" min="1" max="10" value={mood}
                  onChange={e => setMood(Number(e.target.value))} className="w-full" />
              </div>

              {/* Gratitude Fields */}
              {type === 'gratitude' && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">3 things I'm grateful for today:</label>
                  {gratitudeItems.map((item, i) => (
                    <input
                      key={i}
                      className="input-field"
                      placeholder={`${i + 1}. I'm grateful for…`}
                      value={item}
                      onChange={e => {
                        const arr = [...gratitudeItems];
                        arr[i] = e.target.value;
                        setGratitudeItems(arr);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* CBT Fields */}
              {type === 'cbt_thought' && (
                <div className="space-y-3">
                  {[
                    { key: 'situation',        placeholder: 'Situation: What happened?'                      },
                    { key: 'automaticThought', placeholder: 'Automatic thought: What went through your mind?' },
                    { key: 'emotion',          placeholder: 'Emotion + intensity (e.g. Anxiety 80%)'          },
                    { key: 'balancedThought',  placeholder: 'Balanced thought: A more realistic perspective…' },
                  ].map(({ key, placeholder }) => (
                    <input
                      key={key}
                      className="input-field"
                      placeholder={placeholder}
                      value={cbt[key]}
                      onChange={e => setCbt(p => ({ ...p, [key]: e.target.value }))}
                    />
                  ))}
                  <select
                    className="input-field"
                    value={cbt.cognitiveDistortion}
                    onChange={e => setCbt(p => ({ ...p, cognitiveDistortion: e.target.value }))}
                  >
                    <option value="">Select cognitive distortion (optional)…</option>
                    {CBT_DISTORTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <textarea
                    className="input-field"
                    placeholder="Additional notes…"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={2}
                  />
                </div>
              )}

              {/* Free-text types */}
              {!['gratitude', 'cbt_thought'].includes(type) && (
                <textarea
                  className="input-field"
                  placeholder={
                    type === 'vent'
                      ? "This is your safe space. Let it all out. No judgment, ever. 💜"
                      : "Start writing…"
                  }
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={7}
                />
              )}

              {/* Privacy toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    isPrivate
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}
                >
                  {isPrivate ? '🔒 Private' : '🌐 Shared'}
                </button>
                <span className="text-xs text-gray-500">
                  {isPrivate ? 'Only you can see this entry.' : 'May be visible to your counselor.'}
                </span>
              </div>

              {/* AI Insight */}
              {aiInsight ? (
                <div className="p-4 rounded-xl space-y-3 animate-fade-in"
                  style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
                  <p className="text-xs font-medium text-purple-400 flex items-center gap-1">
                    <Sparkles size={12} /> Mira's Insight
                  </p>
                  <p className="text-sm text-gray-300">{aiInsight.insight}</p>
                  {aiInsight.positiveReframe && (
                    <p className="text-sm text-emerald-400">💚 {aiInsight.positiveReframe}</p>
                  )}
                  {aiInsight.copingStrategies?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Suggested coping strategies:</p>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {aiInsight.copingStrategies.map(s => <li key={s}>• {s}</li>)}
                      </ul>
                    </div>
                  )}
                  {aiInsight.followUpQuestion && (
                    <p className="text-xs text-cyan-400 italic">💭 {aiInsight.followUpQuestion}</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={getAIInsight}
                  disabled={gettingInsight}
                  className="btn-secondary text-sm w-full"
                >
                  {gettingInsight
                    ? <Loader size={14} className="animate-spin" />
                    : <Sparkles size={14} className="text-purple-400" />
                  }
                  {gettingInsight ? "Getting Mira's insight…" : "Get AI Insight from Mira"}
                </button>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={closeForm} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">
                  {submitting
                    ? <Loader size={14} className="animate-spin" />
                    : <BookOpen size={14} />
                  }
                  Save Entry +15 XP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── View Journal Modal ── */}
      {selectedJournal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedJournal(null)}
        >
          <div
            className="card w-full max-w-xl p-6 max-h-[80vh] overflow-y-auto animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0 pr-3">
                <h2 className="font-semibold text-base">{selectedJournal.title}</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(selectedJournal.date).toLocaleDateString('en', {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => deleteJournal(selectedJournal._id)}
                  className="p-2 rounded-lg text-rose-400 hover:bg-rose-400/10 transition-colors">
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setSelectedJournal(null)}
                  className="p-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap mb-4">
              <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {typeInfo(selectedJournal.type)?.label}
              </span>
              {selectedJournal.mood && (
                <span className="badge bg-white/5 text-gray-400 border border-white/10">
                  Mood: {selectedJournal.mood}/10
                </span>
              )}
              {selectedJournal.wordCount > 0 && (
                <span className="badge bg-white/5 text-gray-400 border border-white/10">
                  {selectedJournal.wordCount} words
                </span>
              )}
            </div>

            <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
              {selectedJournal.content}
            </div>

            {selectedJournal.aiInsight && (
              <div className="mt-4 p-3 rounded-xl"
                style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
                <p className="text-xs font-medium text-purple-400 mb-1">✨ Mira's Insight</p>
                <p className="text-xs text-gray-300">{selectedJournal.aiInsight}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Journal List ── */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="card h-36 skeleton" />)}
        </div>
      ) : journals.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          <BookOpen size={48} className="mx-auto mb-4 text-gray-700" />
          <p className="font-medium">Your journal is empty</p>
          <p className="text-sm mt-1">Start writing to reflect, heal, and grow.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4 text-sm">
            Write First Entry
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {journals.map(j => (
            <button
              key={j._id}
              onClick={() => setSelectedJournal(j)}
              className="card text-left glass-hover"
            >
              <div className="flex items-center justify-between mb-2 gap-2">
                <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs flex-shrink-0">
                  {typeInfo(j.type)?.label}
                </span>
                <span className="text-xs text-gray-600 flex-shrink-0">
                  {new Date(j.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <h3 className="font-medium text-sm mb-1.5 line-clamp-1">{j.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{j.content}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-600">{j.wordCount || 0} words</span>
                {j.mood > 0 && (
                  <span className="text-xs text-purple-400">Mood: {j.mood}/10</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
