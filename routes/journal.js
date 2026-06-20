const router = require('express').Router();
const Journal = require('../models/Journal');
const User = require('../models/User');
const { CrisisAlert } = require('../models/Community');
const { protect } = require('../middleware/auth');
const { detectCrisis, analyzeSentiment } = require('../config/crisisDetection');

// @POST /api/journal
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, mood, type, tags, isPrivate, cbt, gratitudeItems } = req.body;
    
    const crisisResult = detectCrisis(content);
    const sentimentScore = analyzeSentiment(content);
    
    const journal = await Journal.create({
      user: req.user._id,
      title, content, mood, type, tags, isPrivate,
      cbt, gratitudeItems,
      sentimentScore,
      crisisFlag: crisisResult.detected && ['high', 'critical'].includes(crisisResult.severity)
    });
    
    if (crisisResult.detected && ['high', 'critical'].includes(crisisResult.severity)) {
      await CrisisAlert.create({
        user: req.user._id,
        source: 'journal',
        severity: crisisResult.severity,
        triggerText: content.substring(0, 200),
        keywords: crisisResult.keywords
      });
    }
    
    const user = await User.findById(req.user._id);
    user.addXP(15);
    user.wellness.totalJournals += 1;
    await user.save();
    
    res.status(201).json({ success: true, data: journal, xpGained: 15 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

// @GET /api/journal
router.get('/', protect, async (req, res) => {
  try {
    const { type, limit = 50, page = 1 } = req.query;
    const query = { user: req.user._id };
    if (type) query.type = type;
    
    const journals = await Journal.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Journal.countDocuments(query);
    res.json({ success: true, data: journals, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch journals' });
  }
});

// @GET /api/journal/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const journal = await Journal.findOne({ _id: req.params.id, user: req.user._id });
    if (!journal) return res.status(404).json({ error: 'Journal not found' });
    res.json({ success: true, data: journal });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch journal' });
  }
});

// @PUT /api/journal/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const journal = await Journal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!journal) return res.status(404).json({ error: 'Journal not found' });
    res.json({ success: true, data: journal });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update journal' });
  }
});

// @DELETE /api/journal/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Journal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Journal deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete journal' });
  }
});

module.exports = router;
