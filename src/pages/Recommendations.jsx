import { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';
import { Sparkles, Activity, BookMarked, Wind, Star, RefreshCw, Trophy, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Recommendations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      // Gather user data for personalized recommendations
      let moodData = {};
      try {
        const analyticsRes = await API.get('/mood/analytics?days=14');
        const d = analyticsRes.data.data || {};
        moodData = { avgMood: d.avgMood, topTags: d.topTags?.map(t => t[0]), sleepAvg: d.avgSleep };
      } catch { /* use defaults */ }

      const r = await API.post('/ai/recommendations', { ...moodData, streakDays: 0 });
      setData(r.data.data);
    } catch {
      toast.error('Failed to load recommendations');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRecommendations(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Personalizing your recommendations...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Personalized Recommendations</h1>
          <p className="text-gray-400 text-sm mt-1">AI-curated just for you based on your mood patterns</p>
        </div>
        <button onClick={fetchRecommendations} className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 hover:border-purple-500/30 text-sm text-gray-300 transition-all">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {data && <>
        {/* Affirmation */}
        <div className="glass rounded-2xl p-6 border border-purple-500/20 text-center">
          <Star size={24} className="mx-auto text-amber-400 mb-3" />
          <p className="text-purple-200 italic text-base font-medium">"{data.affirmation}"</p>
        </div>

        {/* Weekly challenge */}
        {data.weeklyChallenge && (
          <div className="glass rounded-2xl p-5 border border-amber-500/20 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Trophy size={24} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-amber-400 font-semibold mb-1">⚡ WEEKLY CHALLENGE</p>
              <p className="font-semibold">{data.weeklyChallenge.title}</p>
              <p className="text-gray-400 text-sm mt-0.5">{data.weeklyChallenge.description}</p>
            </div>
            <span className="text-xs text-amber-400 font-bold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              +{data.weeklyChallenge.xpReward} XP
            </span>
          </div>
        )}

        {/* Activities */}
        <div>
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2"><Activity size={18} className="text-emerald-400" /> Recommended Activities</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {data.activities?.map((act, i) => (
              <div key={i} className="glass rounded-2xl p-5 border border-emerald-500/10 hover:border-emerald-500/30 transition-all">
                <div className="text-3xl mb-3">{act.icon}</div>
                <p className="font-semibold text-sm mb-1">{act.title}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{act.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{act.duration}</span>
                  <span className="text-xs text-gray-500 capitalize">{act.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2"><BookMarked size={18} className="text-blue-400" /> Suggested Resources</h2>
          <div className="space-y-3">
            {data.resources?.map((res, i) => (
              <div key={i} className="glass rounded-2xl p-4 border border-blue-500/10 hover:border-blue-500/30 transition-all flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <BookMarked size={16} className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{res.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{res.reason}</p>
                </div>
                <span className="text-xs text-blue-400 capitalize bg-blue-400/10 px-2 py-0.5 rounded-full">{res.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exercises */}
        <div>
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2"><Wind size={18} className="text-purple-400" /> Mindfulness Exercises</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {data.exercises?.map((ex, i) => (
              <div key={i} className="glass rounded-2xl p-5 border border-purple-500/10 hover:border-purple-500/30 transition-all">
                <p className="font-semibold text-sm mb-1">{ex.name}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{ex.benefit}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">{ex.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>}
    </div>
  );
}
