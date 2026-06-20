const router = require('express').Router();
const Mood = require('../models/Mood');
const User = require('../models/User');
const { CrisisAlert } = require('../models/Community');
const { protect } = require('../middleware/auth');
const { detectCrisis, analyzeSentiment } = require('../config/crisisDetection');

// @POST /api/mood - Log mood
router.post('/', protect, async (req, res) => {
  try {
    const { mood, emoji, label, note, tags, academicLoad, sleepHours, exercised, socialInteraction, physicalSymptoms } = req.body;
    
    const crisisResult = detectCrisis(note);
    const sentimentScore = analyzeSentiment(note);
    
    const moodLog = await Mood.create({
      user: req.user._id,
      mood, emoji, label, note, tags,
      academicLoad, sleepHours, exercised, socialInteraction, physicalSymptoms,
      sentimentScore,
      crisisKeywordsDetected: crisisResult.detected,
      crisisKeywords: crisisResult.keywords
    });
    
    // Create crisis alert if detected
    if (crisisResult.detected && ['high', 'critical'].includes(crisisResult.severity)) {
      await CrisisAlert.create({
        user: req.user._id,
        source: 'mood_log',
        severity: crisisResult.severity,
        triggerText: note,
        keywords: crisisResult.keywords
      });
      await User.findByIdAndUpdate(req.user._id, { crisisFlag: true });
    }
    
    // XP and streak update
    const user = await User.findById(req.user._id);
    user.addXP(10);
    user.wellness.totalMoodLogs += 1;
    
    const today = new Date().toDateString();
    const lastCheckin = user.wellness.lastCheckin ? new Date(user.wellness.lastCheckin).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastCheckin === yesterday) {
      user.wellness.streak += 1;
    } else if (lastCheckin !== today) {
      user.wellness.streak = 1;
    }
    user.wellness.lastCheckin = new Date();
    
    // Award badges
    if (user.wellness.streak === 7 && !user.wellness.badges.includes('week_warrior')) {
      user.wellness.badges.push('week_warrior');
    }
    if (user.wellness.totalMoodLogs === 30 && !user.wellness.badges.includes('mood_master')) {
      user.wellness.badges.push('mood_master');
    }
    
    await user.save();
    
    res.status(201).json({
      success: true,
      data: moodLog,
      crisisDetected: crisisResult.detected,
      crisisSeverity: crisisResult.severity,
      xpGained: 10,
      wellness: user.wellness
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log mood' });
  }
});

// @GET /api/mood - Get mood history
router.get('/', protect, async (req, res) => {
  try {
    const { days = 30, limit = 100 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    
    const moods = await Mood.find({
      user: req.user._id,
      date: { $gte: since }
    }).sort({ date: -1 }).limit(parseInt(limit));
    
    res.json({ success: true, data: moods });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch moods' });
  }
});

// @GET /api/mood/analytics - Mood analytics
router.get('/analytics', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    
    const moods = await Mood.find({ user: req.user._id, date: { $gte: since } });
    
    if (!moods.length) return res.json({ success: true, data: {} });
    
    const avgMood = moods.reduce((s, m) => s + m.mood, 0) / moods.length;
    const avgSleep = moods.filter(m => m.sleepHours).reduce((s, m) => s + m.sleepHours, 0) / moods.length;
    const exerciseDays = moods.filter(m => m.exercised).length;
    
    // Mood trend by day
    const dailyMoods = {};
    moods.forEach(m => {
      const day = new Date(m.date).toLocaleDateString();
      if (!dailyMoods[day]) dailyMoods[day] = [];
      dailyMoods[day].push(m.mood);
    });
    
    const moodTrend = Object.entries(dailyMoods).map(([date, moodArr]) => ({
      date,
      avgMood: moodArr.reduce((s, v) => s + v, 0) / moodArr.length
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Sleep vs mood correlation
    const sleepMoodCorrelation = moods
      .filter(m => m.sleepHours)
      .map(m => ({ sleep: m.sleepHours, mood: m.mood }));
    
    // Top tags
    const tagCount = {};
    moods.forEach(m => m.tags?.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; }));
    const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    // Academic load vs mood
    const academicMoodData = moods
      .filter(m => m.academicLoad != null)
      .map(m => ({ academicLoad: m.academicLoad, mood: m.mood }));
    
    res.json({
      success: true,
      data: {
        avgMood: Math.round(avgMood * 10) / 10,
        avgSleep: Math.round(avgSleep * 10) / 10,
        exerciseDays,
        totalLogs: moods.length,
        moodTrend,
        sleepMoodCorrelation,
        topTags,
        academicMoodData,
        crisisLogsCount: moods.filter(m => m.crisisKeywordsDetected).length
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

module.exports = router;
