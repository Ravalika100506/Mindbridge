import { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';
import { Users, Plus, MessageCircle, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'all', 'anxiety', 'depression', 'stress', 'relationships',
  'academics', 'general', 'victory', 'seeking_advice'
];

const REACTIONS = [
  { key: 'heart',     emoji: '❤️', label: 'Love'         },
  { key: 'hug',       emoji: '🤗', label: 'Hug'          },
  { key: 'strong',    emoji: '💪', label: 'Strong'        },
  { key: 'understand',emoji: '🫂', label: 'I understand'  },
];

const CAT_COLOR = {
  anxiety: '#f59e0b', depression: '#8b5cf6', stress: '#f43f5e',
  relationships: '#ec4899', academics: '#06b6d4', victory: '#10b981',
  seeking_advice: '#a78bfa', general: '#6b7280'
};
const getCatColor = (cat) => CAT_COLOR[cat] || '#6b7280';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', isAnonymous: true, category: 'general', displayName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});

  useEffect(() => { fetchPosts(); }, [category]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/community/posts?category=${category}&limit=30`);
      setPosts(res.data.data || []);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const submitPost = async () => {
    if (!newPost.content.trim()) return toast.error('Write something first!');
    if (newPost.content.length > 1000) return toast.error('Post too long (max 1000 characters)');
    setSubmitting(true);
    try {
      await API.post('/community/posts', newPost);
      toast.success('Posted! Your voice matters 💜');
      setShowForm(false);
      setNewPost({ content: '', isAnonymous: true, category: 'general', displayName: '' });
      fetchPosts();
    } catch {
      toast.error('Failed to post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const react = async (postId, reaction) => {
    try {
      const res = await API.post(`/community/posts/${postId}/react`, { reaction });
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, reactions: res.data.reactions } : p));
    } catch {
      // Silently fail — user may have already reacted
    }
  };

  const toggleReplies = (postId) => {
    setExpandedReplies(prev => ({ ...prev, [postId]: !prev[postId] }));
    if (!expandedReplies[postId]) setReplyingTo(null);
  };

  const submitReply = async (postId) => {
    if (!replyText.trim()) return;
    try {
      await API.post(`/community/posts/${postId}/reply`, {
        content: replyText, isAnonymous: true
      });
      setReplyText('');
      setReplyingTo(null);
      toast.success('Reply sent 💙');
      fetchPosts();
    } catch {
      toast.error('Failed to reply');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Community</h1>
          <p className="text-gray-400 text-sm mt-1">Anonymous peer support — you are not alone</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={18} /> Share
        </button>
      </div>

      {/* Safe space banner */}
      <div className="p-3 rounded-xl text-xs flex items-center gap-2"
        style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
        <span className="text-purple-400 flex-shrink-0">🛡️</span>
        <span className="text-gray-400">
          Safe, judgment-free space. Be kind. Posts are anonymous by default.
          Crisis posts are reviewed by counselors.
        </span>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-all flex-shrink-0"
            style={category === cat
              ? { background: getCatColor(cat), color: '#fff', boxShadow: `0 0 15px ${getCatColor(cat)}50` }
              : { background: 'rgba(255,255,255,0.05)', color: '#9090b0' }
            }
          >
            {cat === 'all' ? '🌐 All' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* New Post Form */}
      {showForm && (
        <div className="card p-5 space-y-4 animate-scale-in" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Share with the community</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
              <X size={18} />
            </button>
          </div>
          <textarea
            className="input-field"
            placeholder="What's on your mind? Share freely — this community cares. 💜"
            value={newPost.content}
            onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
            rows={4}
          />
          <div className="flex justify-end">
            <span className="text-xs text-gray-600">{newPost.content.length}/1000</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            <select
              className="input-field flex-1 min-w-[140px]"
              value={newPost.category}
              onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))}
            >
              {CATEGORIES.filter(c => c !== 'all').map(c => (
                <option key={c} value={c} className="capitalize">{c.replace('_', ' ')}</option>
              ))}
            </select>
            <button
              onClick={() => setNewPost(p => ({ ...p, isAnonymous: !p.isAnonymous }))}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0 ${
                newPost.isAnonymous
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              {newPost.isAnonymous ? '🎭 Anonymous' : '👤 Named'}
            </button>
          </div>
          {!newPost.isAnonymous && (
            <input
              className="input-field"
              placeholder="Display name"
              value={newPost.displayName}
              onChange={e => setNewPost(p => ({ ...p, displayName: e.target.value }))}
            />
          )}
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
            <button onClick={submitPost} disabled={submitting} className="btn-primary flex-1 text-sm">
              {submitting
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send size={14} />
              }
              Post
            </button>
          </div>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="card h-32 skeleton" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          <Users size={48} className="mx-auto mb-4 text-gray-700" />
          <p>No posts in this category yet.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4 text-sm px-4 py-2">
            Be the first to share
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => {
            const color = getCatColor(post.category);
            const repliesExpanded = expandedReplies[post._id];
            return (
              <div key={post._id} className="card glass-hover">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: `${color}20`, color }}
                    >
                      {post.isAnonymous ? '🎭' : post.displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{post.displayName || 'Anonymous Soul'}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(post.date).toLocaleDateString('en', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className="badge capitalize text-xs"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                  >
                    {post.category?.replace('_', ' ')}
                  </span>
                </div>

                {/* Content */}
                <p className="text-sm text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Reactions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {REACTIONS.map(({ key, emoji, label }) => {
                    const count = post.reactions?.[key] || 0;
                    return (
                      <button
                        key={key}
                        onClick={() => react(post._id, key)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all hover:scale-105"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        title={label}
                      >
                        <span>{emoji}</span>
                        <span className="text-gray-400">{count > 0 ? count : label}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => toggleReplies(post._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs ml-auto transition-all hover:bg-white/5"
                    style={{ color: '#9090b0' }}
                  >
                    <MessageCircle size={12} />
                    {post.replies?.length || 0} {post.replies?.length === 1 ? 'reply' : 'replies'}
                  </button>
                </div>

                {/* Replies */}
                {repliesExpanded && (
                  <div className="mt-4">
                    {post.replies?.length > 0 && (
                      <div className="space-y-2 pl-4 border-l border-white/5 mb-3">
                        {post.replies.map((r, i) => (
                          <div key={i} className="flex gap-2 items-start">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-white/5 flex-shrink-0 mt-0.5">
                              {r.isAnonymous ? '💙' : r.displayName?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 mb-0.5">{r.displayName || 'Peer Supporter'}</p>
                              <p className="text-xs text-gray-300">{r.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply input */}
                    <div className="flex gap-2">
                      <input
                        className="input-field flex-1 text-xs py-2"
                        placeholder="Send anonymous support…"
                        value={replyingTo === post._id ? replyText : ''}
                        onChange={e => { setReplyingTo(post._id); setReplyText(e.target.value); }}
                        onKeyDown={e => e.key === 'Enter' && submitReply(post._id)}
                      />
                      <button
                        onClick={() => submitReply(post._id)}
                        className="btn-primary px-3 py-2"
                        disabled={!replyText.trim() || replyingTo !== post._id}
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
