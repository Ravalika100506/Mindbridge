import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API } from '../context/AuthContext';
import { Brain, Send, Sparkles, Heart, BarChart2, RefreshCw, Lightbulb, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const EMOTION_CONFIG = {
  happy:     { emoji: '😊', color: 'from-yellow-400 to-amber-400', bg: 'bg-yellow-500/10 border-yellow-500/30',   label: 'Happy'      },
  sad:       { emoji: '😢', color: 'from-blue-400 to-indigo-500',  bg: 'bg-blue-500/10 border-blue-500/30',       label: 'Sad'        },
  anxious:   { emoji: '😰', color: 'from-orange-400 to-red-500',   bg: 'bg-orange-500/10 border-orange-500/30',   label: 'Anxious'    },
  angry:     { emoji: '😤', color: 'from-red-500 to-rose-600',     bg: 'bg-red-500/10 border-red-500/30',         label: 'Angry'      },
  stressed:  { emoji: '😫', color: 'from-purple-400 to-violet-600',bg: 'bg-purple-500/10 border-purple-500/30',   label: 'Stressed'   },
  neutral:   { emoji: '😐', color: 'from-gray-400 to-slate-500',   bg: 'bg-gray-500/10 border-gray-500/30',       label: 'Neutral'    },
  hopeful:   { emoji: '🌟', color: 'from-teal-400 to-emerald-500', bg: 'bg-teal-500/10 border-teal-500/30',       label: 'Hopeful'    },
  lonely:    { emoji: '🌙', color: 'from-indigo-400 to-blue-600',  bg: 'bg-indigo-500/10 border-indigo-500/30',  label: 'Lonely'     },
  overwhelmed:{ emoji: '🌊', color: 'from-cyan-400 to-blue-500',   bg: 'bg-cyan-500/10 border-cyan-500/30',       label: 'Overwhelmed'},
  excited:   { emoji: '🎉', color: 'from-pink-400 to-fuchsia-500', bg: 'bg-pink-500/10 border-pink-500/30',       label: 'Excited'    },
};

const SAMPLE_PROMPTS = [
  "I have three exams next week and I can't sleep properly. My mind just won't stop racing.",
  "I feel like no one really understands what I'm going through. I've been isolating myself.",
  "Finally got my results today and I did so well! All the hard work paid off!",
  "Everything feels like too much. I don't know where to start or what to do.",
];

export default function EmotionDetector() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const analyze = async () => {
    if (!text.trim() || text.trim().length < 10) {
      toast.error('Please write at least a few words for accurate analysis');
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/ai/emotion', { text });
      setResult(res.data.data);
    } catch {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const primaryEmotion = result?.primaryEmotion?.toLowerCase();
  const emotionCfg = EMOTION_CONFIG[primaryEmotion] || EMOTION_CONFIG.neutral;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border border-white/10">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Brain className="text-violet-400" size={26} /> Emotion Detection
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Share how you're feeling in your own words. Our NLP engine will analyze your emotional state and provide personalized insights.
        </p>
      </motion.div>

      {/* Input Area */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-5 border border-white/10 space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-300 block mb-2">How are you feeling right now?</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Express yourself freely... This is a safe space. Describe your thoughts, feelings, or what happened today."
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 resize-none transition-all"
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-600">{text.length}/1000 characters</p>
            <p className="text-xs text-gray-600">Minimum 10 characters for analysis</p>
          </div>
        </div>

        {/* Sample prompts */}
        <div>
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Sparkles size={10} /> Try a sample</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => setText(p)}
                className="text-xs glass border border-white/10 text-gray-400 hover:text-white hover:border-violet-500/30 px-3 py-1.5 rounded-lg transition-all text-left">
                "{p.substring(0, 40)}..."
              </button>
            ))}
          </div>
        </div>

        <button onClick={analyze} disabled={loading || text.trim().length < 10}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition-all">
          {loading ? <><RefreshCw size={16} className="animate-spin" /> Analyzing your emotions...</> : <><Brain size={16} /> Analyze My Emotions</>}
        </button>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {/* Primary Emotion */}
            <div className={`glass rounded-2xl p-6 border ${emotionCfg.bg} space-y-4`}>
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${emotionCfg.color}/20 flex items-center justify-center text-5xl`}>
                  {emotionCfg.emoji}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Primary Emotion Detected</p>
                  <h2 className="font-display text-3xl font-bold">{result.primaryEmotion}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-white/10 rounded-full h-2 w-32">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence || 75}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${emotionCfg.color}`} />
                    </div>
                    <span className="text-xs text-gray-400">{result.confidence || 75}% confidence</span>
                  </div>
                </div>
              </div>

              {/* Insight */}
              {result.insight && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Heart size={10} /> Empathetic Insight</p>
                  <p className="text-sm text-gray-200 leading-relaxed">{result.insight}</p>
                </div>
              )}
            </div>

            {/* Emotion breakdown */}
            {result.emotionBreakdown && Object.keys(result.emotionBreakdown).length > 0 && (
              <div className="glass rounded-2xl p-5 border border-white/10">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><BarChart2 size={14} className="text-violet-400" /> Emotion Breakdown</h3>
                <div className="space-y-2.5">
                  {Object.entries(result.emotionBreakdown).sort(([,a],[,b]) => b-a).map(([emotion, score]) => {
                    const cfg = EMOTION_CONFIG[emotion.toLowerCase()] || { emoji: '💭', color: 'from-gray-400 to-gray-500' };
                    return (
                      <div key={emotion} className="flex items-center gap-3">
                        <span className="text-base w-6 flex-shrink-0">{cfg.emoji}</span>
                        <span className="text-xs text-gray-400 w-24 capitalize flex-shrink-0">{emotion}</span>
                        <div className="flex-1 bg-white/10 rounded-full h-1.5">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full bg-gradient-to-r ${cfg.color}`} />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right flex-shrink-0">{score}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Themes & Coping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.themes?.length > 0 && (
                <div className="glass rounded-2xl p-5 border border-white/10">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Sparkles size={14} className="text-cyan-400" /> Detected Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.themes.map(t => (
                      <span key={t} className="text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 px-3 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.copingStrategies?.length > 0 && (
                <div className="glass rounded-2xl p-5 border border-white/10">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Lightbulb size={14} className="text-amber-400" /> Suggested Coping</h3>
                  <ul className="space-y-1.5">
                    {result.copingStrategies.slice(0, 3).map(s => (
                      <li key={s} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5 flex-shrink-0">→</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Chat with Mira', path: '/chat', icon: '🤖', desc: 'Get AI support' },
                { label: 'Log Mood', path: '/mood', icon: '💜', desc: 'Track this feeling' },
                { label: 'View Resources', path: '/resources', icon: '📚', desc: 'Self-help content' },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.path)}
                  className="glass border border-white/10 hover:border-violet-500/30 rounded-xl p-3 text-left transition-all group">
                  <span className="text-xl">{a.icon}</span>
                  <p className="text-xs font-semibold mt-1 group-hover:text-violet-300 transition-colors">{a.label}</p>
                  <p className="text-[10px] text-gray-600">{a.desc}</p>
                </button>
              ))}
            </div>

            {/* Re-analyze */}
            <button onClick={() => { setResult(null); setText(''); }}
              className="w-full py-2.5 rounded-xl glass border border-white/10 text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2 transition-all">
              <RefreshCw size={14} /> Analyze New Text
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
