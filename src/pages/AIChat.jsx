import { useState, useRef, useEffect } from 'react';
import { useAuth, API } from '../context/AuthContext';
import { Send, RefreshCw, Sparkles, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const STARTERS = [
  "I'm feeling really overwhelmed with exams 😔",
  "I've been feeling lonely lately and don't know what to do",
  "How can I manage my anxiety during presentations?",
  "I'm struggling with motivation to study",
  "Can you teach me a quick relaxation technique?",
  "I had a panic attack today, what should I do?",
];

const TypingIndicator = () => (
  <div className="flex gap-2 items-end px-1 py-2">
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
      style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
    >
      🧠
    </div>
    <div
      className="flex gap-1 items-center px-4 py-3 rounded-2xl rounded-tl-sm"
      style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.15)' }}
    >
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-purple-400"
          style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  </div>
);

const MdMessage = ({ content }) => (
  <ReactMarkdown
    components={{
      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
      strong: ({ children }) => <strong className="font-semibold text-purple-300">{children}</strong>,
      a: ({ children, href }) => <a href={href} className="text-cyan-400 underline" target="_blank" rel="noreferrer">{children}</a>,
      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
      li: ({ children }) => <li>{children}</li>,
    }}
  >
    {content}
  </ReactMarkdown>
);

export default function AIChat() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi ${firstName}! 💜 I'm **Mira**, your AI companion on MindBridge.\n\nI'm here to listen, support you through tough times, and help you find healthy ways to cope with the pressures of student life. Everything you share with me stays between us.\n\nHow are you feeling today?`
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text = input.trim()) => {
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

      // Fix 5: user.wellness doesn't have 'lastMood'; use 'totalMoodLogs' as context instead
      const res = await API.post('/ai/chat', {
        message: text,
        history,
        sessionContext: {
          name: user?.name,
          university: user?.university,
          recentMood: user?.wellness?.totalMoodLogs > 0 ? 'has been logging moods' : null
        }
      });

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);

      if (res.data.crisisDetected) {
        setCrisisDetected(true);
        toast.error('We care about your safety 💜', { duration: 5000 });
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. If you need immediate help, call iCall: **9152987821** 💜"
      }]);
      toast.error('Connection issue. Please try again.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Hi again ${firstName}! 💜 Let's start fresh. How are you feeling right now?`
    }]);
    setCrisisDetected(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col animate-fade-in" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
          >
            🧠
          </div>
          <div>
            <h1 className="font-display font-bold text-xl flex items-center gap-2">
              Mira <Sparkles size={16} className="text-purple-400" />
            </h1>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Always here for you
            </p>
          </div>
        </div>
        <button onClick={clearChat} className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5">
          <RefreshCw size={13} /> New Chat
        </button>
      </div>

      {/* Crisis Banner */}
      {crisisDetected && (
        <div className="mb-4 flex items-center gap-3 p-4 rounded-xl text-sm flex-shrink-0"
          style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <AlertTriangle size={18} className="text-rose-400 flex-shrink-0" />
          <div>
            <span className="text-rose-300 font-medium">We're here for you. </span>
            <span className="text-gray-400">If you're in immediate danger, call </span>
            <strong className="text-rose-300">iCall: 9152987821</strong>
            <span className="text-gray-400"> or Vandrevala: </span>
            <strong className="text-rose-300">1860-2662-345</strong>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 self-end font-bold"
              style={{
                background: msg.role === 'assistant'
                  ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
                  : 'rgba(139,92,246,0.3)'
              }}
            >
              {msg.role === 'assistant' ? '🧠' : user?.name?.[0]?.toUpperCase()}
            </div>

            {/* Bubble */}
            <div
              className="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={{
                borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                  : 'rgba(19,19,31,0.95)',
                border: msg.role === 'assistant' ? '1px solid rgba(139,92,246,0.15)' : 'none',
                color: '#f0f0ff'
              }}
            >
              <MdMessage content={msg.content} />
            </div>
          </div>
        ))}

        {loading && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      {/* Quick Starters */}
      {messages.length === 1 && (
        <div className="py-3 flex-shrink-0">
          <p className="text-xs text-gray-500 mb-2">Start with:</p>
          <div className="flex gap-2 flex-wrap">
            {STARTERS.map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="mt-3 flex gap-2 items-end flex-shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Talk to Mira… (Enter to send, Shift+Enter for new line)"
          className="input-field flex-1 resize-none"
          rows={Math.min(4, Math.max(1, input.split('\n').length))}
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="btn-primary p-3 rounded-xl self-end disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading
            ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Send size={18} />
          }
        </button>
      </div>

      <p className="text-center text-xs text-gray-600 mt-2 flex-shrink-0">
        Mira is an AI, not a licensed therapist. Crisis line:{' '}
        <a href="tel:9152987821" className="text-rose-400 hover:underline">iCall 9152987821</a>
      </p>
    </div>
  );
}
