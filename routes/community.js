// community route
const { CommunityPost, CrisisAlert, WellnessGoal, BreathingSession, AcademicEvent } = require('../models/Community');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { detectCrisis } = require('../config/crisisDetection');
const router = require('express').Router();

router.get('/posts', protect, async (req, res) => {
  try {
    const { category, limit = 20, page = 1 } = req.query;
    const query = { isFlagged: false };
    if (category && category !== 'all') query.category = category;
    const posts = await CommunityPost.find(query).sort({ date: -1 }).limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit)).lean();
    const sanitized = posts.map(p => ({ ...p, user: p.isAnonymous ? null : p.user }));
    res.json({ success: true, data: sanitized });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch posts' }); }
});

router.post('/posts', protect, async (req, res) => {
  try {
    const { content, isAnonymous, category, tags, displayName } = req.body;
    const crisisResult = detectCrisis(content);
    const post = await CommunityPost.create({ user: req.user._id, content, isAnonymous, category, tags, displayName: isAnonymous ? (displayName || 'Anonymous Soul') : req.user.name, crisisFlag: crisisResult.detected });
    if (crisisResult.detected && ['high', 'critical'].includes(crisisResult.severity)) {
      await CrisisAlert.create({ user: req.user._id, source: 'community_post', severity: crisisResult.severity, triggerText: content, keywords: crisisResult.keywords });
    }
    const user = await User.findById(req.user._id);
    user.addXP(5); await user.save();
    res.status(201).json({ success: true, data: post });
  } catch (err) { res.status(500).json({ error: 'Failed to create post' }); }
});

router.post('/posts/:id/react', protect, async (req, res) => {
  try {
    const { reaction } = req.body;
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!post.reactedUsers.includes(req.user._id)) {
      post.reactions[reaction] = (post.reactions[reaction] || 0) + 1;
      post.reactedUsers.push(req.user._id);
      await post.save();
    }
    res.json({ success: true, reactions: post.reactions });
  } catch (err) { res.status(500).json({ error: 'Failed to react' }); }
});

router.post('/posts/:id/reply', protect, async (req, res) => {
  try {
    const { content, isAnonymous, displayName } = req.body;
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.replies.push({ user: req.user._id, content, isAnonymous, displayName: isAnonymous ? (displayName || 'Peer Supporter') : req.user.name });
    await post.save();
    res.json({ success: true, data: post });
  } catch (err) { res.status(500).json({ error: 'Failed to reply' }); }
});

module.exports = router;
