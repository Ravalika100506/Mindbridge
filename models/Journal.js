const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Untitled Entry', maxlength: 200 },
  content: { type: String, required: true, maxlength: 5000 },
  mood: { type: Number, min: 1, max: 10 },
  type: {
    type: String,
    enum: ['free_write', 'gratitude', 'cbt_thought', 'daily_reflection', 'goal_setting', 'vent'],
    default: 'free_write'
  },
  tags: [{ type: String }],
  isPrivate: { type: Boolean, default: true },
  
  // AI analysis fields
  aiInsight: { type: String, default: '' },
  aiThemes: [{ type: String }],
  sentimentScore: { type: Number, default: 0 },
  suggestedCopingStrategies: [{ type: String }],
  crisisFlag: { type: Boolean, default: false },
  
  // CBT fields (for cbt_thought type)
  cbt: {
    situation: { type: String, default: '' },
    automaticThought: { type: String, default: '' },
    emotion: { type: String, default: '' },
    cognitiveDistortion: { type: String, default: '' },
    balancedThought: { type: String, default: '' }
  },
  
  // Gratitude fields
  gratitudeItems: [{ type: String }],
  
  date: { type: Date, default: Date.now },
  wordCount: { type: Number, default: 0 }
}, { timestamps: true });

journalSchema.pre('save', function(next) {
  this.wordCount = this.content.split(/\s+/).filter(w => w).length;
  next();
});

journalSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Journal', journalSchema);
