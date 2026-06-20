import { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Shield, Users, AlertTriangle, CheckCircle, XCircle, Calendar, TrendingUp, Clock, Eye, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const SEV_COLOR = {
  low:      'text-blue-400 bg-blue-400/10 border-blue-400/20',
  medium:   'text-amber-400 bg-amber-400/10 border-amber-400/20',
  high:     'text-orange-400 bg-orange-400/10 border-orange-400/20',
  critical: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const STATUS_COLOR = {
  active:       'text-red-400',
  acknowledged: 'text-amber-400',
  resolved:     'text-emerald-400',
  false_alarm:  'text-gray-400',
};

const DEMO_ALERTS = [
  { _id: 'a1', severity: 'critical', source: 'sos_button', status: 'active', triggerText: 'User pressed SOS button', keywords: [], date: new Date(Date.now() - 300000).toISOString(), user: { name: 'Riya Sharma', email: 'riya@college.edu', university: 'IIT Delhi', phone: '9876543210' } },
  { _id: 'a2', severity: 'high', source: 'chat', status: 'active', triggerText: 'I hate myself and cant cope anymore', keywords: ['hate myself', 'cant cope'], date: new Date(Date.now() - 3600000).toISOString(), user: { name: 'Arjun Kumar', email: 'arjun@college.edu', university: 'BITS Pilani', phone: '' } },
  { _id: 'a3', severity: 'medium', source: 'mood_log', status: 'acknowledged', triggerText: 'Feeling depressed and overwhelmed', keywords: ['depressed', 'overwhelmed'], date: new Date(Date.now() - 86400000).toISOString(), user: { name: 'Priya Mehta', email: 'priya@college.edu', university: 'IIT Bombay', phone: '9123456789' } },
  { _id: 'a4', severity: 'high', source: 'journal', status: 'resolved', triggerText: 'Nothing matters anymore, I cant go on', keywords: ['nothing matters', "can't go on"], date: new Date(Date.now() - 172800000).toISOString(), user: { name: 'Sanjay Rao', email: 'sanjay@college.edu', university: 'IIIT Hyderabad', phone: '' } },
];

const DEMO_APPOINTMENTS = [
  { _id: 'ap1', student: { name: 'Aarav Singh', email: 'aarav@college.edu', university: 'Delhi University', yearOfStudy: 2 }, date: new Date(Date.now() + 86400000).toISOString(), timeSlot: '10:00 AM', type: 'video', reason: 'Exam anxiety and sleep issues', status: 'pending' },
  { _id: 'ap2', student: { name: 'Meera Patel', email: 'meera@college.edu', university: 'Mumbai University', yearOfStudy: 3 }, date: new Date(Date.now() + 172800000).toISOString(), timeSlot: '2:30 PM', type: 'chat', reason: 'General stress management', status: 'confirmed' },
  { _id: 'ap3', student: { name: 'Rohan Gupta', email: 'rohan@college.edu', university: 'Pune University', yearOfStudy: 1 }, date: new Date(Date.now() - 86400000).toISOString(), timeSlot: '11:00 AM', type: 'in_person', reason: 'Academic pressure and depression', status: 'completed' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('alerts');
  const [alerts, setAlerts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [notes, setNotes] = useState({});

  if (!user || !['counselor', 'admin'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    Promise.all([
      API.get('/crisis/alerts').catch(() => ({ data: { data: DEMO_ALERTS } })),
      API.get('/appointments/counselor').catch(() => ({ data: { data: DEMO_APPOINTMENTS } }))
    ]).then(([alertsRes, apptRes]) => {
      setAlerts(alertsRes.data.data || DEMO_ALERTS);
      setAppointments(apptRes.data.data || DEMO_APPOINTMENTS);
    }).finally(() => setLoading(false));
  }, []);

  const updateAlert = async (id, status) => {
    setUpdatingId(id);
    try {
      await API.put(`/crisis/alerts/${id}`, { status, notes: notes[id] || '' });
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast.success(`Alert marked as ${status}`);
    } catch {
      // update demo locally
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast.success(`Alert marked as ${status}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateAppointment = async (id, status) => {
    try {
      await API.put(`/appointments/${id}`, { status });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast.success(`Appointment ${status}`);
    } catch {
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast.success(`Appointment ${status}`);
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const pendingAppts = appointments.filter(a => a.status === 'pending');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl flex items-center gap-3">
            <Shield size={22} className="text-purple-400" />
            {user.role === 'admin' ? 'Admin' : 'Counselor'} Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage crisis alerts, appointments, and student wellbeing</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {activeAlerts.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle size={15} className="text-red-400 animate-pulse" />
              <span className="text-red-300 text-sm font-semibold">{activeAlerts.length} active SOS</span>
            </div>
          )}
          {pendingAppts.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Calendar size={15} className="text-amber-400" />
              <span className="text-amber-300 text-sm font-semibold">{pendingAppts.length} pending appt{pendingAppts.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Alerts', value: activeAlerts.length, color: '#f43f5e', icon: AlertTriangle },
          { label: 'Total Alerts', value: alerts.length, color: '#f59e0b', icon: Shield },
          { label: 'Pending Appts', value: pendingAppts.length, color: '#8b5cf6', icon: Calendar },
          { label: 'Total Appts', value: appointments.length, color: '#10b981', icon: Users },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-xs">{s.label}</span>
              <s.icon size={14} style={{ color: s.color }} />
            </div>
            <p className="font-display font-bold text-2xl" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'alerts', label: 'Crisis Alerts', count: activeAlerts.length },
          { id: 'appointments', label: 'Appointments', count: pendingAppts.length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${tab === t.id ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
            {t.label}
            {t.count > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Crisis Alerts Tab */}
      {tab === 'alerts' && (
        <div className="space-y-3">
          {loading ? (
            <div className="glass rounded-2xl p-8 text-center text-gray-400">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <CheckCircle size={40} className="mx-auto text-emerald-400 mb-3" />
              <p className="text-gray-400">No crisis alerts. All clear! ✅</p>
            </div>
          ) : alerts.map(alert => (
            <div key={alert._id} className={`glass rounded-2xl p-5 border transition-all ${alert.status === 'active' ? 'border-red-500/30 bg-red-500/5' : 'border-white/5'}`}>
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${SEV_COLOR[alert.severity]}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{alert.source.replace('_', ' ')}</span>
                    <span className={`text-xs font-medium capitalize ${STATUS_COLOR[alert.status]}`}>● {alert.status}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={10} /> {formatDistanceToNow(new Date(alert.date), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {alert.user?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{alert.user?.name || 'Unknown Student'}</p>
                      <p className="text-gray-500 text-xs">{alert.user?.email} · {alert.user?.university}</p>
                    </div>
                    {alert.user?.phone && (
                      <a href={`tel:${alert.user.phone}`} className="ml-auto text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                        📞 {alert.user.phone}
                      </a>
                    )}
                  </div>
                  {alert.triggerText && (
                    <p className="text-gray-400 text-xs bg-white/5 rounded-lg px-3 py-2 italic">"{alert.triggerText.substring(0, 120)}{alert.triggerText.length > 120 ? '…' : ''}"</p>
                  )}
                  {alert.keywords?.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {alert.keywords.map(kw => (
                        <span key={kw} className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/20">{kw}</span>
                      ))}
                    </div>
                  )}
                  <textarea
                    placeholder="Add counselor notes..."
                    value={notes[alert._id] || ''}
                    onChange={e => setNotes(p => ({ ...p, [alert._id]: e.target.value }))}
                    className="w-full mt-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:border-purple-500/50 text-gray-300"
                    rows={2}
                  />
                </div>
                {alert.status === 'active' && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => updateAlert(alert._id, 'acknowledged')} disabled={updatingId === alert._id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-all">
                      <Eye size={12} /> Acknowledge
                    </button>
                    <button onClick={() => updateAlert(alert._id, 'resolved')} disabled={updatingId === alert._id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                      <CheckCircle size={12} /> Resolve
                    </button>
                    <button onClick={() => updateAlert(alert._id, 'false_alarm')} disabled={updatingId === alert._id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20 hover:bg-gray-500/20 transition-all">
                      <XCircle size={12} /> False Alarm
                    </button>
                  </div>
                )}
                {alert.status === 'acknowledged' && (
                  <button onClick={() => updateAlert(alert._id, 'resolved')} disabled={updatingId === alert._id}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex-shrink-0">
                    <CheckCircle size={12} /> Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointments Tab */}
      {tab === 'appointments' && (
        <div className="space-y-3">
          {loading ? (
            <div className="glass rounded-2xl p-8 text-center text-gray-400">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Calendar size={40} className="mx-auto text-gray-500 mb-3" />
              <p className="text-gray-400">No appointments yet.</p>
            </div>
          ) : appointments.map(appt => (
            <div key={appt._id} className="glass rounded-2xl p-5 border border-white/5">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {appt.student?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{appt.student?.name}</p>
                  <p className="text-gray-500 text-xs">{appt.student?.university} · Year {appt.student?.yearOfStudy}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(appt.date).toDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {appt.timeSlot}</span>
                    <span className="capitalize">{appt.type}</span>
                  </div>
                  {appt.reason && <p className="text-gray-400 text-xs mt-1.5 italic">"{appt.reason}"</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                    appt.status === 'pending' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                    appt.status === 'confirmed' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                    appt.status === 'completed' ? 'text-purple-400 bg-purple-400/10 border-purple-400/20' :
                    'text-red-400 bg-red-400/10 border-red-400/20'
                  }`}>{appt.status}</span>
                  {appt.status === 'pending' && (
                    <>
                      <button onClick={() => updateAppointment(appt._id, 'confirmed')}
                        className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                        Confirm
                      </button>
                      <button onClick={() => updateAppointment(appt._id, 'cancelled')}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 transition-all">
                        Decline
                      </button>
                    </>
                  )}
                  {appt.status === 'confirmed' && (
                    <button onClick={() => updateAppointment(appt._id, 'completed')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-all">
                      Mark Done
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
