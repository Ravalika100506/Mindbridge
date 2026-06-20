const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  counselor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // e.g. "10:00 AM"
  duration: { type: Number, default: 30 }, // minutes
  type: { type: String, enum: ['chat', 'video', 'in_person'], default: 'chat' },
  reason: { type: String, maxlength: 500 },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  notes: { type: String, default: '' }, // counselor notes
  meetLink: { type: String, default: '' }, // for video calls
  cancelReason: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
