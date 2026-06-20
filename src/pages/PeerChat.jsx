import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { API } from '../context/AuthContext';
import { io } from 'socket.io-client';
import {
  MessageSquare, Send, Users, Heart, Shield, RefreshCw,
  Smile, AlertCircle, Hash, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const ROOMS = [
  { id: 'general',       label: 'General',       icon: '💬', desc: 'Open conversation' },
  { id: 'anxiety',       label: 'Anxiety',        icon: '😰', desc: 'Anxiety & stress' },
  { id: 'academics',     label: 'Academics',      icon: '📚', desc: 'Study pressure' },
  { id: 'loneliness',    label: 'Loneliness',     icon: '🌙', desc: 'Feeling isolated' },
  { id: 'motivation',    label: 'Motivation',     icon: '⚡', desc: 'Getting back on track' },
  { id: 'celebration',   label: 'Wins',           icon: '🎉', desc: 'Share good news' },
];

const ANONYMOUS_NAMES = [
  'Quiet Star', 'Gentle Wave', 'Brave Soul', 'Kind Moon', 'Calm River',
  'Hopeful Light', 'Serene Cloud', 'Warm Breeze', 'Soft Rain', 'Open Heart',
  'Rising Sun', 'Still Water', 'Tender Flame', 'Free Spirit', 'Wise Owl'
];

function getAnonName(socketId) {
  if (!socketId) return 'Anonymous';
  const idx = Math.abs(socketId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % ANONYMOUS_NAMES.length;
  return ANONYMOUS_NAMES[idx];
}

const REACTIONS = ['❤️', '🤗', '💪', '✨', '🙏'];

export default function PeerChat() {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState('general');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [myAnonName] = useState(() => ANONYMOUS_NAMES[Math.floor(Math.random() * ANONYMOUS_NAMES.length)]);
  const [roomCounts, setRoomCounts] = useState({});
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('mb_token');
    if (!token) return;

    const s = io('/', {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    s.on('connect', () => {
      s.emit('peer:join', { room });
    });

    s.on('peer:message', (msg) => {
      setMessages(prev => [...prev.slice(-199), msg]);
    });

    s.on('peer:system', (msg) => {
      setMessages(prev => [...prev.slice(-199), { ...msg, isSystem: true }]);
    });

    s.on('online_count', setOnlineCount);
    s.on('peer:room_counts', setRoomCounts);

    s.on('peer:typing', ({ name }) => {
      setTypingUser(name);
      setTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setTyping(false), 3000);
    });

    s.on('peer:reaction', ({ msgId, reaction, count }) => {
      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, reactions: { ...(m.reactions || {}), [reaction]: count } } : m
      ));
    });

    s.on('connect_error', () => {
      // Silent fail — socket might not support peer chat in v2
    });

    setSocket(s);
    return () => {
      s.disconnect();
      clearTimeout(typingTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    setMessages([]);
    socket.emit('peer:join', { room });
  }, [room, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    const msg = {
      id: `${Date.now()}-${Math.random()}`,
      content: input.trim(),
      displayName: myAnonName,
      room,
      timestamp: new Date().toISOString(),
      isMine: true,
      reactions: {}
    };

    // Optimistic local add
    setMessages(prev => [...prev, msg]);
    socket.emit('peer:send', { content: input.trim(), room, displayName: myAnonName, id: msg.id });
    setInput('');
    socket.emit('peer:stop_typing', { room });
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socket) return;
    socket.emit('peer:typing', { room, name: myAnonName });
  };

  const sendReaction = (msgId, reaction) => {
    if (!socket) return;
    socket.emit('peer:react', { msgId, reaction, room });
    // Optimistic
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, reactions: { ...(m.reactions || {}), [reaction]: ((m.reactions || {})[reaction] || 0) + 1 } } : m
    ));
  };

  const formatTime = (ts) => {
    try { return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-4 border border-white/10 flex-shrink-0">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-xl font-bold flex items-center gap-2">
              <MessageSquare className="text-cyan-400" size={22} /> Anonymous Peer Chat
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <Shield size={11} /> Your identity is fully protected · You appear as <strong className="text-cyan-400">{myAnonName}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 glass px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {onlineCount} online
            </span>
          </div>
        </div>

        {/* Safety notice */}
        <div className="mt-3 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
          <AlertCircle size={13} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-300">
            This is a moderated, anonymous safe space. Be kind and supportive. Crisis content is auto-detected and will trigger counselor alerts.
          </p>
        </div>
      </motion.div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Room Selector */}
        <div className="hidden sm:flex flex-col gap-1.5 w-48 flex-shrink-0">
          <p className="text-xs text-gray-500 uppercase tracking-wider px-1 mb-1 flex items-center gap-1"><Hash size={10} /> Rooms</p>
          {ROOMS.map(r => (
            <button key={r.id} onClick={() => setRoom(r.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all text-sm border ${
                room === r.id
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                  : 'glass text-gray-400 hover:text-white border-white/5'
              }`}>
              <span className="text-base">{r.icon}</span>
              <div>
                <p className="font-medium text-xs">{r.label}</p>
                <p className="text-[10px] text-gray-600">{r.desc}</p>
              </div>
            </button>
          ))}
          <div className="mt-auto glass rounded-xl p-3 border border-white/5">
            <p className="text-xs text-gray-500 mb-1.5 font-medium">Community Rules</p>
            {['Be kind & supportive','No personal info','No hate speech','Report concerns',"It's OK to vent"].map(r => (
              <p key={r} className="text-[10px] text-gray-600 flex items-center gap-1 mb-0.5"><Heart size={8} className="text-pink-400" />{r}</p>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col glass rounded-2xl border border-white/10 overflow-hidden min-h-0">
          {/* Room header */}
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3 flex-shrink-0">
            <span className="text-xl">{ROOMS.find(r => r.id === room)?.icon}</span>
            <div>
              <p className="text-sm font-semibold">{ROOMS.find(r => r.id === room)?.label} Room</p>
              <p className="text-xs text-gray-500">{ROOMS.find(r => r.id === room)?.desc}</p>
            </div>
            {/* Mobile room switcher */}
            <select value={room} onChange={e => setRoom(e.target.value)}
              className="sm:hidden ml-auto text-xs glass border border-white/10 rounded-lg px-2 py-1 bg-transparent text-gray-300">
              {ROOMS.map(r => <option key={r.id} value={r.id} className="bg-gray-900">{r.icon} {r.label}</option>)}
            </select>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                <Sparkles size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No messages yet in this room.</p>
                <p className="text-xs mt-1">Be the first to share — you're anonymous here 💙</p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, i) => {
                if (msg.isSystem) return (
                  <motion.div key={msg.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center text-xs text-gray-600 py-1">{msg.content}</motion.div>
                );

                return (
                  <motion.div key={msg.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
                    {!msg.isMine && (
                      <p className="text-[10px] text-gray-500 mb-1 px-1">{msg.displayName}</p>
                    )}
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.isMine
                        ? 'bg-cyan-600/30 border border-cyan-500/30 text-white rounded-br-sm'
                        : 'bg-white/8 border border-white/10 text-gray-200 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[10px] text-gray-600">{formatTime(msg.timestamp)}</span>
                      {/* Reactions */}
                      <div className="flex gap-1">
                        {REACTIONS.map(r => {
                          const count = msg.reactions?.[r];
                          return (
                            <button key={r} onClick={() => sendReaction(msg.id, r)}
                              className={`text-xs px-1.5 py-0.5 rounded-full transition-all hover:scale-110 ${
                                count ? 'bg-white/10 text-white' : 'opacity-0 group-hover:opacity-50 hover:!opacity-100'
                              }`}>
                              {r}{count ? ` ${count}` : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex gap-1">
                  {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                </div>
                {typingUser} is typing...
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/5 flex-shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={handleTyping}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={`Message as ${myAnonName}…`}
                maxLength={500}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
              <button onClick={sendMessage} disabled={!input.trim()}
                className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0">
                <Send size={16} className="text-black" />
              </button>
            </div>
            <p className="text-[10px] text-gray-700 mt-1.5 text-right">{input.length}/500</p>
          </div>
        </div>
      </div>
    </div>
  );
}
