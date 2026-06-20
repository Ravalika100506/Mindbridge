const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['mood_reminder', 'meditation_reminder', 'break_reminder', 'appointment', 'badge_earned', 'crisis_support', 'streak_milestone', 'wellness_goal'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  link: { type: String, default: '' }, // where to navigate on click
  data: { type: mongoose.Schema.Types.Mixed, default: {} }, // extra metadata
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
