import { useState } from 'react';
import { useAuth, API } from '../context/AuthContext';
import { User, Shield, Bell, Save, Flame, Zap, Star, BookOpen, Heart, Wind } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name:         user?.name         || '',
    university:   user?.university   || '',
    department:   user?.department   || '',
    yearOfStudy:  user?.yearOfStudy  || 1,
    phone:        user?.phone        || '',
    emergencyContact: {
      name:     user?.emergencyContact?.name     || '',
      phone:    user?.emergencyContact?.phone    || '',
      relation: user?.emergencyContact?.relation || '',
    },
    preferences: {
      notifications:           user?.preferences?.notifications           ?? true,
      anonymousInCommunity:    user?.preferences?.anonymousInCommunity    ?? true,
      shareDataWithCounselor:  user?.preferences?.shareDataWithCounselor  ?? false,
    }
  });

  const setField  = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const setEC     = (key, val) => setForm(p => ({ ...p, emergencyContact: { ...p.emergencyContact, [key]: val } }));
  const setPref   = (key, val) => setForm(p => ({ ...p, preferences: { ...p.preferences, [key]: val } }));
  const togglePref = (key)    => setPref(key, !form.preferences[key]);

  const save = async () => {
    if (!form.name.trim()) return toast.error('Name cannot be empty');
    setSaving(true);
    try {
      const res = await API.put('/auth/profile', form);
      updateUser(res.data.user);
      toast.success('Profile updated! ✅');
    } catch {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const levelProgress = (user?.wellness?.xp || 0) % 100;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-2xl">My Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Hero */}
      <div
        className="card flex items-center gap-6 p-6"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.04))' }}
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
        >
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-xl truncate">{user?.name}</h2>
          <p className="text-gray-400 text-sm truncate">{user?.email}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="badge bg-purple-500/15 text-purple-400 border border-purple-500/20 capitalize">
              {user?.role || 'student'}
            </span>
            {user?.university && (
              <span className="badge bg-white/5 text-gray-400 border border-white/10">{user.university}</span>
            )}
          </div>
        </div>
        <div className="text-right space-y-1.5 flex-shrink-0">
          <div className="flex items-center gap-1 text-amber-400 justify-end">
            <Flame size={14} />
            <span className="font-bold text-sm">{user?.wellness?.streak || 0}d</span>
          </div>
          <div className="flex items-center gap-1 text-purple-400 justify-end">
            <Zap size={14} />
            <span className="font-bold text-sm">{user?.wellness?.xp || 0} XP</span>
          </div>
          <div className="flex items-center gap-1 text-cyan-400 justify-end">
            <Star size={14} />
            <span className="font-bold text-sm">Lv {user?.wellness?.level || 1}</span>
          </div>
        </div>
      </div>

      {/* XP bar */}
      <div className="card">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-gray-400">Level {user?.wellness?.level || 1} → {(user?.wellness?.level || 1) + 1}</span>
          <span className="text-purple-400">{levelProgress}/100 XP</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${levelProgress}%`, background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)' }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Heart,   label: 'Mood Logs',   value: user?.wellness?.totalMoodLogs || 0,           color: '#f43f5e' },
          { icon: BookOpen,label: 'Journals',     value: user?.wellness?.totalJournals || 0,           color: '#06b6d4' },
          { icon: Wind,    label: 'Breathe',      value: user?.wellness?.totalBreathingSessions || 0,  color: '#10b981' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card text-center py-4">
            <Icon size={18} className="mx-auto mb-1" style={{ color }} />
            <div className="font-bold text-xl" style={{ color }}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Personal Info */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <User size={16} className="text-purple-400" /> Personal Info
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Full Name *</label>
            <input className="input-field" value={form.name} onChange={e => setField('name', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Phone</label>
            <input className="input-field" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setField('phone', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">University</label>
            <input className="input-field" placeholder="e.g. Parul University" value={form.university} onChange={e => setField('university', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Department</label>
            <input className="input-field" placeholder="e.g. CSE, MBA, MBBS" value={form.department} onChange={e => setField('department', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Year of Study</label>
          <select className="input-field" value={form.yearOfStudy} onChange={e => setField('yearOfStudy', Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Shield size={16} className="text-rose-400" /> Emergency Contact
        </h2>
        <p className="text-xs text-gray-500">
          This person will be notified if a crisis is detected on your account.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Name</label>
            <input className="input-field" placeholder="Contact name" value={form.emergencyContact.name} onChange={e => setEC('name', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Phone</label>
            <input className="input-field" placeholder="Phone number" value={form.emergencyContact.phone} onChange={e => setEC('phone', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Relation</label>
            <input className="input-field" placeholder="Parent / Friend" value={form.emergencyContact.relation} onChange={e => setEC('relation', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card space-y-1">
        <h2 className="font-semibold text-sm flex items-center gap-2 mb-3">
          <Bell size={16} className="text-cyan-400" /> Preferences
        </h2>
        {[
          { key: 'notifications',          label: 'Daily mood reminders',          desc: 'Get reminded to log your mood each day'           },
          { key: 'anonymousInCommunity',   label: 'Post anonymously by default',   desc: "Your name won't show on community posts"           },
          { key: 'shareDataWithCounselor', label: 'Share mood data with counselor',desc: 'Your counselor can view your mood trends'          },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => togglePref(key)}
              className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                form.preferences[key] ? 'bg-purple-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                  form.preferences[key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving} className="btn-primary w-full py-3.5">
        {saving
          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <Save size={18} />
        }
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  );
}
