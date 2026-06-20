const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['student', 'counselor', 'admin'], default: 'student' },
  university: { type: String, default: '' },
  department: { type: String, default: '' },
  yearOfStudy: { type: Number, default: 1 },
  phone: { type: String, default: '' },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' }
  },
  preferences: {
    theme: { type: String, default: 'dark' },
    notifications: { type: Boolean, default: true },
    anonymousInCommunity: { type: Boolean, default: true },
    shareDataWithCounselor: { type: Boolean, default: false }
  },
  wellness: {
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastCheckin: { type: Date, default: null },
    badges: [{ type: String }],
    totalMoodLogs: { type: Number, default: 0 },
    totalJournals: { type: Number, default: 0 },
    totalBreathingSessions: { type: Number, default: 0 }
  },
  crisisFlag: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.addXP = function(amount) {
  this.wellness.xp += amount;
  this.wellness.level = Math.floor(this.wellness.xp / 100) + 1;
};

module.exports = mongoose.model('User', userSchema);
