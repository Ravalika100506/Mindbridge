const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: Number, required: true, min: 1, max: 10 }, // 1=very bad, 10=excellent
  emoji: { type: String, default: '' },
  label: { type: String, default: '' }, // Anxious, Happy, Sad, Stressed, Calm etc.
  note: { type: String, default: '', maxlength: 500 },
  
  // Context tags
  tags: [{ type: String }], // exam, assignment, social, sleep, exercise, etc.
  
  // Academic context
  academicLoad: { type: Number, min: 0, max: 10, default: 5 }, // how heavy is workload today
  sleepHours: { type: Number, min: 0, max: 24, default: 7 },
  exercised: { type: Boolean, default: false },
  socialInteraction: { type: Number, min: 0, max: 10, default: 5 },
  
  // AI-analyzed sentiment
  sentimentScore: { type: Number, default: 0 }, // -1 to 1
  crisisKeywordsDetected: { type: Boolean, default: false },
  crisisKeywords: [{ type: String }],
  
  // Physical symptoms
  physicalSymptoms: [{ type: String }], // headache, fatigue, appetite_loss, etc.
  
  date: { type: Date, default: Date.now }
}, { timestamps: true });

moodSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Mood', moodSchema);
