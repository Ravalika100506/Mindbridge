import { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';
import { Calendar, Clock, Video, MessageCircle, User, CheckCircle, XCircle, ChevronRight, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_ICONS = { chat: MessageCircle, video: Video, in_person: User };
const STATUS_COLORS = {
  pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  confirmed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
  completed: 'text-purple-400 bg-purple-400/10 border-purple-400/20'
};

const DEMO_COUNSELORS = [
  { _id: 'c1', name: 'Dr. Priya Sharma', email: 'priya@mindbridge.edu', department: 'Clinical Psychology', avatar: '' },
  { _id: 'c2', name: 'Dr. Rahul Mehta', email: 'rahul@mindbridge.edu', department: 'Student Wellness', avatar: '' },
  { _id: 'c3', name: 'Ms. Ananya Rao', email: 'ananya@mindbridge.edu', department: 'Counseling Services', avatar: '' }
];

const ALL_SLOTS = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
                   '2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM'];

export default function Appointments() {
  const [view, setView] = useState('list');
  const [counselors, setCounselors] = useState(DEMO_COUNSELORS);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ counselorId: '', date: '', timeSlot: '', type: 'chat', reason: '' });
  const [availableSlots, setAvailableSlots] = useState(ALL_SLOTS);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    // Fetch real counselors from API; fall back to demo data
    API.get('/appointments/counselors').then(r => {
      if (r.data.data?.length) setCounselors(r.data.data);
    }).catch(() => {});

    API.get('/appointments/my').then(r => setAppointments(r.data.data || [])).catch(() => {
      setAppointments([
        { _id: 'a1', counselor: DEMO_COUNSELORS[0], date: new Date(Date.now() + 86400000 * 2).toISOString(), timeSlot: '10:00 AM', type: 'video', reason: 'Academic stress', status: 'confirmed' },
        { _id: 'a2', counselor: DEMO_COUNSELORS[1], date: new Date(Date.now() - 86400000 * 5).toISOString(), timeSlot: '2:00 PM', type: 'chat', reason: 'Anxiety management', status: 'completed' }
      ]);
    }).finally(() => setLoading(false));
  }, []);

  // Fetch available slots whenever counselor or date changes
  useEffect(() => {
    if (!form.counselorId || !form.date) {
      setAvailableSlots(ALL_SLOTS);
      return;
    }
    setSlotsLoading(true);
    API.get(`/appointments/slots/${form.counselorId}?date=${form.date}`)
      .then(r => setAvailableSlots(r.data.data || ALL_SLOTS))
      .catch(() => setAvailableSlots(ALL_SLOTS))
      .finally(() => setSlotsLoading(false));
  }, [form.counselorId, form.date]);

  const handleBook = async () => {
    if (!form.counselorId || !form.date || !form.timeSlot) {
      return toast.error('Please fill in all required fields');
    }
    setBooking(true);
    try {
      const r = await API.post('/appointments', form);
      setAppointments(prev => [r.data.data, ...prev]);
      toast.success('Appointment requested! ✅');
      setView('list');
      setForm({ counselorId: '', date: '', timeSlot: '', type: 'chat', reason: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await API.put(`/appointments/${id}`, { status: 'cancelled', cancelReason: 'Cancelled by student' });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a));
      toast.success('Appointment cancelled');
    } catch { toast.error('Failed to cancel'); }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Counselor Appointments</h1>
          <p className="text-gray-400 text-sm mt-1">Book 1-on-1 sessions with professional counselors</p>
        </div>
        <button onClick={() => setView(view === 'book' ? 'list' : 'book')} className="btn-primary flex items-center gap-2">
          {view === 'book' ? <><XCircle size={16} /> Cancel</> : <><Plus size={16} /> Book Session</>}
        </button>
      </div>

      {view === 'book' && (
        <div className="glass rounded-2xl p-6 border border-purple-500/20">
          <h2 className="font-display font-semibold text-lg mb-5 text-purple-300">Book a New Appointment</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {/* Counselor select */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Choose Counselor *</label>
              <select value={form.counselorId} onChange={e => setForm(p => ({ ...p, counselorId: e.target.value, timeSlot: '' }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50">
                <option value="">Select a counselor...</option>
                {counselors.map(c => <option key={c._id} value={c._id}>{c.name} — {c.department}</option>)}
              </select>
            </div>
            {/* Session type */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Session Type</label>
              <div className="flex gap-2">
                {['chat','video','in_person'].map(t => (
                  <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${form.type === t ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                    {t === 'in_person' ? 'In Person' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {/* Date */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Preferred Date *</label>
              <input type="date" min={minDate} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value, timeSlot: '' }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50" />
            </div>
            {/* Time slot */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Time Slot * {slotsLoading && <span className="text-purple-400">(loading...)</span>}
              </label>
              {availableSlots.length === 0 ? (
                <p className="text-amber-400 text-xs mt-2">No available slots for this date. Please choose another date.</p>
              ) : (
                <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto">
                  {availableSlots.map(slot => (
                    <button key={slot} onClick={() => setForm(p => ({ ...p, timeSlot: slot }))}
                      className={`py-1.5 rounded-lg text-xs font-medium transition-all ${form.timeSlot === slot ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Reason */}
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Reason for Appointment (optional)</label>
              <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                placeholder="Briefly describe what you'd like to discuss..."
                rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-purple-500/50" />
            </div>
          </div>
          <div className="flex justify-end mt-5">
            <button onClick={handleBook} disabled={booking} className="btn-primary px-8">
              {booking ? 'Booking...' : 'Request Appointment'}
            </button>
          </div>
        </div>
      )}

      {/* Available counselors */}
      {view === 'list' && (
        <div className="grid md:grid-cols-3 gap-4">
          {counselors.map(c => (
            <div key={c._id} className="glass rounded-2xl p-5 border border-white/5 hover:border-purple-500/20 transition-all">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold mb-3">
                {c.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-sm">{c.name}</h3>
              <p className="text-gray-400 text-xs mt-0.5">{c.department}</p>
              <button onClick={() => { setView('book'); setForm(p => ({ ...p, counselorId: c._id })); }}
                className="mt-3 w-full py-2 rounded-xl text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-all flex items-center justify-center gap-1">
                Book Session <ChevronRight size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* My appointments */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4">My Appointments</h2>
        {loading ? (
          <div className="glass rounded-2xl p-8 text-center text-gray-400">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <Calendar size={40} className="mx-auto text-gray-500 mb-3" />
            <p className="text-gray-400">No appointments yet. Book your first session!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map(apt => {
              const Icon = TYPE_ICONS[apt.type] || MessageCircle;
              const isUpcoming = new Date(apt.date) > new Date() && apt.status !== 'cancelled';
              return (
                <div key={apt._id} className="glass rounded-2xl p-5 border border-white/5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {apt.counselor?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{apt.counselor?.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <Calendar size={11} /> {new Date(apt.date).toDateString()}
                        </span>
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <Clock size={11} /> {apt.timeSlot}
                        </span>
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <Icon size={11} /> {apt.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[apt.status]}`}>
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span>
                    {isUpcoming && (
                      <button onClick={() => handleCancel(apt._id)} className="text-red-400 text-xs hover:text-red-300 flex items-center gap-1">
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                    {apt.status === 'confirmed' && apt.meetLink && (
                      <a href={apt.meetLink} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
                        <Video size={14} /> Join
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
