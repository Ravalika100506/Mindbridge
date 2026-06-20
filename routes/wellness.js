const router = require('express').Router();
const { WellnessGoal, BreathingSession, AcademicEvent } = require('../models/Community');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/goals', protect, async (req, res) => {
  try {
    const goals = await WellnessGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: goals });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch goals' }); }
});

router.post('/goals', protect, async (req, res) => {
  try {
    const goal = await WellnessGoal.create({ user: req.user._id, ...req.body });
    res.status(201).json({ success: true, data: goal });
  } catch (err) { res.status(500).json({ error: 'Failed to create goal' }); }
});

router.put('/goals/:id', protect, async (req, res) => {
  try {
    const goal = await WellnessGoal.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (goal?.isCompleted) {
      const user = await User.findById(req.user._id);
      user.addXP(goal.xpReward); await user.save();
    }
    res.json({ success: true, data: goal });
  } catch (err) { res.status(500).json({ error: 'Failed to update goal' }); }
});

router.delete('/goals/:id', protect, async (req, res) => {
  try {
    const result = await WellnessGoal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!result) return res.status(404).json({ error: 'Goal not found' });
    res.json({ success: true, message: 'Goal deleted' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete goal' }); }
});

router.post('/breathing', protect, async (req, res) => {
  try {
    const session = await BreathingSession.create({ user: req.user._id, ...req.body });
    const user = await User.findById(req.user._id);
    user.addXP(8); user.wellness.totalBreathingSessions += 1;
    if (user.wellness.totalBreathingSessions === 10 && !user.wellness.badges.includes('zen_master')) user.wellness.badges.push('zen_master');
    await user.save();
    res.status(201).json({ success: true, data: session, xpGained: 8 });
  } catch (err) { res.status(500).json({ error: 'Failed to log session' }); }
});

router.get('/breathing/history', protect, async (req, res) => {
  try {
    const sessions = await BreathingSession.find({ user: req.user._id }).sort({ date: -1 }).limit(20);
    res.json({ success: true, data: sessions });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch history' }); }
});

router.get('/academic-events', protect, async (req, res) => {
  try {
    const events = await AcademicEvent.find({ user: req.user._id, dueDate: { $gte: new Date() } }).sort({ dueDate: 1 });
    res.json({ success: true, data: events });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch events' }); }
});

router.post('/academic-events', protect, async (req, res) => {
  try {
    const event = await AcademicEvent.create({ user: req.user._id, ...req.body });
    res.status(201).json({ success: true, data: event });
  } catch (err) { res.status(500).json({ error: 'Failed to create event' }); }
});

router.put('/academic-events/:id', protect, async (req, res) => {
  try {
    const event = await AcademicEvent.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    res.json({ success: true, data: event });
  } catch (err) { res.status(500).json({ error: 'Failed to update event' }); }
});

router.get('/leaderboard', protect, async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('name wellness university').sort({ 'wellness.xp': -1 }).limit(20);
    res.json({ success: true, data: users });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch leaderboard' }); }
});

router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('wellness');
    res.json({ success: true, data: user.wellness });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch stats' }); }
});

module.exports = router;
