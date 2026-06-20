const mongoose = require('mongoose');

// Community Post (Anonymous Vent Wall)
const communityPostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 },
  isAnonymous: { type: Boolean, default: true },
  displayName: { type: String, default: 'Anonymous Soul' },
  category: {
    type: String,
    enum: ['anxiety', 'depression', 'stress', 'relationships', 'academics', 'general', 'victory', 'seeking_advice'],
    default: 'general'
  },
  reactions: {
    heart: { type: Number, default: 0 },
    hug: { type: Number, default: 0 },
    strong: { type: Number, default: 0 },
    understand: { type: Number, default: 0 }
  },
  reactedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, maxlength: 500 },
    isAnonymous: { type: Boolean, default: true },
    displayName: { type: String, default: 'Peer Supporter' },
    createdAt: { type: Date, default: Date.now }
  }],
  isModerated: { type: Boolean, default: false },
  isFlagged: { type: Boolean, default: false },
  crisisFlag: { type: Boolean, default: false },
  tags: [{ type: String }],
  date: { type: Date, default: Date.now }
}, { timestamps: true });

// Crisis Alert
const crisisAlertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  source: { type: String, enum: ['mood_log', 'journal', 'community_post', 'chat', 'sos_button', 'ai_detected'], required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  triggerText: { type: String, default: '' },
  keywords: [{ type: String }],
  status: { type: String, enum: ['active', 'acknowledged', 'resolved', 'false_alarm'], default: 'active' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  notes: { type: String, default: '' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

// Wellness Goal
const wellnessGoalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['mood', 'sleep', 'exercise', 'social', 'academic', 'mindfulness', 'custom'], default: 'custom' },
  targetValue: { type: Number, default: 1 },
  currentValue: { type: Number, default: 0 },
  unit: { type: String, default: 'times' },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  isCompleted: { type: Boolean, default: false },
  startDate: { type: Date, default: Date.now },
  targetDate: { type: Date },
  xpReward: { type: Number, default: 20 }
}, { timestamps: true });

// Breathing Session
const breathingSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  technique: { type: String, enum: ['4-7-8', 'box', 'diaphragmatic', '2-1-4-1', 'coherent'], default: '4-7-8' },
  durationMinutes: { type: Number, default: 5 },
  cyclesCompleted: { type: Number, default: 0 },
  moodBefore: { type: Number, min: 1, max: 10 },
  moodAfter: { type: Number, min: 1, max: 10 },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

// Academic Event (for stress correlation)
const academicEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['exam', 'assignment', 'presentation', 'group_project', 'internship', 'lab', 'other'], default: 'other' },
  subject: { type: String, default: '' },
  dueDate: { type: Date, required: true },
  stressLevel: { type: Number, min: 1, max: 10, default: 5 },
  isCompleted: { type: Boolean, default: false },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = {
  CommunityPost: mongoose.model('CommunityPost', communityPostSchema),
  CrisisAlert: mongoose.model('CrisisAlert', crisisAlertSchema),
  WellnessGoal: mongoose.model('WellnessGoal', wellnessGoalSchema),
  BreathingSession: mongoose.model('BreathingSession', breathingSessionSchema),
  AcademicEvent: mongoose.model('AcademicEvent', academicEventSchema)
};
