const router = require('express').Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, counselorOrAdmin } = require('../middleware/auth');

// Get all counselors
router.get('/counselors', protect, async (req, res) => {
  try {
    const counselors = await User.find({ role: 'counselor', isActive: true })
      .select('name email university department avatar');
    res.json({ success: true, data: counselors });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch counselors' });
  }
});

// Book appointment
router.post('/', protect, async (req, res) => {
  try {
    const { counselorId, date, timeSlot, type, reason } = req.body;
    if (!counselorId || !date || !timeSlot) {
      return res.status(400).json({ error: 'Counselor, date, and time slot are required' });
    }

    // Check for conflicts
    const conflict = await Appointment.findOne({
      counselor: counselorId, date: new Date(date), timeSlot,
      status: { $in: ['pending', 'confirmed'] }
    });
    if (conflict) return res.status(400).json({ error: 'This time slot is already booked' });

    const appointment = await Appointment.create({
      student: req.user._id, counselor: counselorId,
      date: new Date(date), timeSlot, type, reason
    });

    // Notify counselor
    await Notification.create({
      user: counselorId, type: 'appointment',
      title: 'New Appointment Request',
      message: `${req.user.name} has requested a ${type} session on ${new Date(date).toDateString()} at ${timeSlot}`,
      link: '/appointments', data: { appointmentId: appointment._id }
    });

    await appointment.populate('counselor', 'name email');
    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// Get my appointments (student)
router.get('/my', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ student: req.user._id })
      .populate('counselor', 'name email avatar')
      .sort({ date: -1 }).limit(20);
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get appointments for counselor
router.get('/counselor', protect, counselorOrAdmin, async (req, res) => {
  try {
    const appointments = await Appointment.find({ counselor: req.user._id })
      .populate('student', 'name email university department yearOfStudy')
      .sort({ date: 1 });
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Update appointment status
router.put('/:id', protect, async (req, res) => {
  try {
    const { status, notes, meetLink, cancelReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    // Auth check
    const isCounselor = appointment.counselor.toString() === req.user._id.toString();
    const isStudent = appointment.student.toString() === req.user._id.toString();
    if (!isCounselor && !isStudent) return res.status(403).json({ error: 'Unauthorized' });

    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    if (meetLink) appointment.meetLink = meetLink;
    if (cancelReason) appointment.cancelReason = cancelReason;
    await appointment.save();

    // Notify the other party
    const notifyUser = isCounselor ? appointment.student : appointment.counselor;
    const statusMsg = { confirmed: 'confirmed ✅', cancelled: 'cancelled ❌', completed: 'marked as completed' };
    if (statusMsg[status]) {
      await Notification.create({
        user: notifyUser, type: 'appointment',
        title: `Appointment ${status}`,
        message: `Your appointment on ${new Date(appointment.date).toDateString()} at ${appointment.timeSlot} has been ${statusMsg[status]}`,
        link: '/appointments'
      });
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Get available slots for a counselor on a date
router.get('/slots/:counselorId', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const ALL_SLOTS = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
                       '2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM'];
    const booked = await Appointment.find({
      counselor: req.params.counselorId,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    }).select('timeSlot');
    const bookedSlots = booked.map(a => a.timeSlot);
    const available = ALL_SLOTS.filter(s => !bookedSlots.includes(s));
    res.json({ success: true, data: available });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

module.exports = router;
