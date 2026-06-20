// crisis.js
const router = require('express').Router();
const { CrisisAlert } = require('../models/Community');
const User = require('../models/User');
const { protect, counselorOrAdmin } = require('../middleware/auth');

router.post('/sos', protect, async (req, res) => {
  try {
    const alert = await CrisisAlert.create({ user: req.user._id, source: 'sos_button', severity: 'critical', triggerText: 'User pressed SOS button' });
    await User.findByIdAndUpdate(req.user._id, { crisisFlag: true });
    res.status(201).json({ success: true, data: alert });
  } catch (err) { res.status(500).json({ error: 'SOS failed' }); }
});

router.get('/alerts', protect, counselorOrAdmin, async (req, res) => {
  try {
    const alerts = await CrisisAlert.find({ status: 'active' }).populate('user', 'name email phone university').sort({ date: -1 });
    res.json({ success: true, data: alerts });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch alerts' }); }
});

router.put('/alerts/:id', protect, counselorOrAdmin, async (req, res) => {
  try {
    const alert = await CrisisAlert.findByIdAndUpdate(req.params.id, { status: req.body.status, resolvedBy: req.user._id, resolvedAt: new Date(), notes: req.body.notes }, { new: true });
    res.json({ success: true, data: alert });
  } catch (err) { res.status(500).json({ error: 'Failed to update alert' }); }
});

module.exports = router;
