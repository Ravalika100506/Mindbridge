import { useState } from 'react';
import { API } from '../context/AuthContext';
import { AlertTriangle, Phone, Wind, MessageCircle, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const HELPLINES = [
  { name: 'iCall (TISS)',             number: '9152987821',    desc: 'Mon–Sat 8am–10pm · Free · English & Hindi',   emoji: '💜' },
  { name: 'Vandrevala Foundation',    number: '1860-2662-345', desc: '24/7 · All India · Multiple languages',        emoji: '🌙' },
  { name: 'NIMHANS',                  number: '080-46110007',  desc: 'National mental health helpline',              emoji: '🏥' },
  { name: 'Snehi Foundation',         number: '044-24640050',  desc: 'Emotional support helpline',                   emoji: '🤝' },
  { name: 'iCall (National)',         number: '9820466627',    desc: '24/7 · Suicide prevention',                    emoji: '🆘' },
];

const GROUNDING_STEPS = [
  'Take 3 slow, deep breaths right now.',
  'Name 5 things you can see around you.',
  'Place your feet flat on the floor. Feel the ground.',
  'Hold something cold or warm in your hands.',
  'Say your name and today\'s date out loud.',
];

export default function Crisis() {
  const [sosSent, setSosSent] = useState(false);
  const [sending, setSending] = useState(false);

  const sendSOS = async () => {
    if (sosSent || sending) return;
    setSending(true);
    try {
      await API.post('/crisis/sos');
      setSosSent(true);
      toast.error(
        '🚨 SOS alert sent! A counselor has been notified. Please also call a helpline now.',
        { duration: 10000 }
      );
    } catch {
      toast.error('SOS send failed — please call directly: 9152987821');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-rose-300">Crisis Support</h1>
        <p className="text-gray-400 text-sm mt-1">You are not alone. Immediate help is available right now.</p>
      </div>

      {/* SOS Button */}
      <div
        className="card text-center py-10"
        style={{ borderColor: 'rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.04)' }}
      >
        <p className="text-gray-400 text-sm mb-6">
          If you are in immediate danger or having thoughts of self-harm:
        </p>
        <button
          onClick={sendSOS}
          disabled={sending || sosSent}
          className="mx-auto flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
          style={{
            background: sosSent
              ? 'rgba(16,185,129,0.3)'
              : 'linear-gradient(135deg, #f43f5e, #c026d3)',
            boxShadow: sosSent
              ? '0 0 30px rgba(16,185,129,0.3)'
              : '0 0 40px rgba(244,63,94,0.4)',
          }}
        >
          {sending
            ? <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            : sosSent ? '✅' : '🆘'
          }
          {sosSent ? 'Counselor Notified' : sending ? 'Sending…' : 'Send SOS Alert'}
        </button>
        {sosSent && (
          <div className="mt-5 animate-fade-in">
            <p className="text-sm text-emerald-400 mb-1">✅ Your counselor has been notified.</p>
            <p className="text-gray-400 text-sm mb-3">Please also call a helpline right now:</p>
            <a
              href="tel:9152987821"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-base"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #c026d3)' }}
            >
              <Phone size={16} /> iCall: 9152987821
            </a>
          </div>
        )}
      </div>

      {/* Helplines */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm text-rose-300 flex items-center gap-2">
          <Phone size={14} /> Call Right Now
        </h2>
        {HELPLINES.map(h => (
          <a
            key={h.name}
            href={`tel:${h.number.replace(/-/g, '')}`}
            className="card flex items-center gap-4 hover:scale-[1.01] transition-transform"
            style={{ borderColor: 'rgba(244,63,94,0.15)' }}
          >
            <span className="text-2xl flex-shrink-0">{h.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{h.name}</p>
              <p className="text-xs text-gray-500">{h.desc}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-rose-400 flex items-center gap-1 justify-end text-sm">
                <Phone size={12} /> {h.number}
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* Grounding Technique */}
      <div className="card" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Shield size={16} className="text-purple-400" /> Ground Yourself Right Now
        </h2>
        <p className="text-sm text-gray-400 mb-3">If you're feeling overwhelmed, do these one at a time:</p>
        <div className="space-y-3">
          {GROUNDING_STEPS.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}
              >
                {i + 1}
              </div>
              <p className="text-sm text-gray-300">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/breathe" className="card glass-hover text-center py-6">
          <Wind size={28} className="text-emerald-400 mx-auto mb-2" />
          <p className="font-medium text-sm">Guided Breathing</p>
          <p className="text-xs text-gray-500 mt-1">Calm your nervous system</p>
        </Link>
        <Link to="/chat" className="card glass-hover text-center py-6">
          <MessageCircle size={28} className="text-purple-400 mx-auto mb-2" />
          <p className="font-medium text-sm">Talk to Mira</p>
          <p className="text-xs text-gray-500 mt-1">AI companion available now</p>
        </Link>
      </div>

      {/* Footer note */}
      <div className="text-center text-xs text-gray-600 pb-4">
        <Heart size={12} className="inline mr-1 text-rose-400" />
        MindBridge cares about you deeply. You matter. Things can and do get better.
      </div>
    </div>
  );
}
