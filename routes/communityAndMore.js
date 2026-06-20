const router = require('express').Router();
const { CommunityPost, CrisisAlert, WellnessGoal, BreathingSession, AcademicEvent } = require('../models/Community');
const User = require('../models/User');
const { protect, counselorOrAdmin } = require('../middleware/auth');
const { detectCrisis } = require('../config/crisisDetection');

module.exports.communityRouter = (() => {
  const r = router;

  // @GET /api/community/posts
  r.get('/posts', protect, async (req, res) => {
    try {
      const { category, limit = 20, page = 1 } = req.query;
      const query = { isFlagged: false };
      if (category && category !== 'all') query.category = category;
      
      const posts = await CommunityPost.find(query)
        .sort({ date: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();
      
      // Hide user info for anonymous posts
      const sanitized = posts.map(p => ({
        ...p,
        user: p.isAnonymous ? null : p.user
      }));
      
      res.json({ success: true, data: sanitized });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  // @POST /api/community/posts
  r.post('/posts', protect, async (req, res) => {
    try {
      const { content, isAnonymous, category, tags, displayName } = req.body;
      
      const crisisResult = detectCrisis(content);
      
      const post = await CommunityPost.create({
        user: req.user._id,
        content, isAnonymous, category, tags,
        displayName: isAnonymous ? (displayName || 'Anonymous Soul') : req.user.name,
        crisisFlag: crisisResult.detected
      });
      
      if (crisisResult.detected && ['high', 'critical'].includes(crisisResult.severity)) {
        await CrisisAlert.create({
          user: req.user._id, source: 'community_post',
          severity: crisisResult.severity, triggerText: content,
          keywords: crisisResult.keywords
        });
      }
      
      const user = await User.findById(req.user._id);
      user.addXP(5);
      await user.save();
      
      res.status(201).json({ success: true, data: post });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create post' });
    }
  });

  // @POST /api/community/posts/:id/react
  r.post('/posts/:id/react', protect, async (req, res) => {
    try {
      const { reaction } = req.body;
      const post = await CommunityPost.findById(req.params.id);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      
      const alreadyReacted = post.reactedUsers.includes(req.user._id);
      if (!alreadyReacted) {
        post.reactions[reaction] = (post.reactions[reaction] || 0) + 1;
        post.reactedUsers.push(req.user._id);
        await post.save();
      }
      
      res.json({ success: true, reactions: post.reactions });
    } catch (err) {
      res.status(500).json({ error: 'Failed to react' });
    }
  });

  // @POST /api/community/posts/:id/reply
  r.post('/posts/:id/reply', protect, async (req, res) => {
    try {
      const { content, isAnonymous, displayName } = req.body;
      const post = await CommunityPost.findById(req.params.id);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      
      post.replies.push({
        user: req.user._id,
        content,
        isAnonymous,
        displayName: isAnonymous ? (displayName || 'Peer Supporter') : req.user.name
      });
      await post.save();
      
      res.json({ success: true, data: post });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add reply' });
    }
  });

  return r;
})();

// Wellness Goals Router
const wellnessRouter = require('express').Router();

wellnessRouter.get('/goals', protect, async (req, res) => {
  try {
    const goals = await WellnessGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: goals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

wellnessRouter.post('/goals', protect, async (req, res) => {
  try {
    const goal = await WellnessGoal.create({ user: req.user._id, ...req.body });
    res.status(201).json({ success: true, data: goal });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

wellnessRouter.put('/goals/:id', protect, async (req, res) => {
  try {
    const goal = await WellnessGoal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true }
    );
    
    if (goal?.isCompleted) {
      const user = await User.findById(req.user._id);
      user.addXP(goal.xpReward);
      await user.save();
    }
    
    res.json({ success: true, data: goal });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

wellnessRouter.post('/breathing', protect, async (req, res) => {
  try {
    const session = await BreathingSession.create({ user: req.user._id, ...req.body });
    const user = await User.findById(req.user._id);
    user.addXP(8);
    user.wellness.totalBreathingSessions += 1;
    if (user.wellness.totalBreathingSessions === 10 && !user.wellness.badges.includes('zen_master')) {
      user.wellness.badges.push('zen_master');
    }
    await user.save();
    res.status(201).json({ success: true, data: session, xpGained: 8 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log breathing session' });
  }
});

wellnessRouter.get('/academic-events', protect, async (req, res) => {
  try {
    const events = await AcademicEvent.find({ user: req.user._id, dueDate: { $gte: new Date() } }).sort({ dueDate: 1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

wellnessRouter.post('/academic-events', protect, async (req, res) => {
  try {
    const event = await AcademicEvent.create({ user: req.user._id, ...req.body });
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

wellnessRouter.get('/leaderboard', protect, async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('name wellness university')
      .sort({ 'wellness.xp': -1 })
      .limit(20);
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Crisis Router
const crisisRouter = require('express').Router();

crisisRouter.post('/sos', protect, async (req, res) => {
  try {
    const alert = await CrisisAlert.create({
      user: req.user._id,
      source: 'sos_button',
      severity: 'critical',
      triggerText: 'User pressed SOS button'
    });
    await User.findByIdAndUpdate(req.user._id, { crisisFlag: true });
    res.status(201).json({ success: true, data: alert, message: 'Help is on the way. Please call a helpline immediately.' });
  } catch (err) {
    res.status(500).json({ error: 'SOS failed' });
  }
});

crisisRouter.get('/alerts', protect, counselorOrAdmin, async (req, res) => {
  try {
    const alerts = await CrisisAlert.find({ status: 'active' })
      .populate('user', 'name email phone university')
      .sort({ date: -1 });
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

crisisRouter.put('/alerts/:id', protect, counselorOrAdmin, async (req, res) => {
  try {
    const alert = await CrisisAlert.findByIdAndUpdate(req.params.id, {
      status: req.body.status,
      resolvedBy: req.user._id,
      resolvedAt: new Date(),
      notes: req.body.notes
    }, { new: true });
    res.json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Resources Router
const resourcesRouter = require('express').Router();

resourcesRouter.get('/', protect, async (req, res) => {
  const resources = [
    { id: 1, category: 'crisis', title: 'iCall - Psychosocial Helpline', type: 'helpline', contact: '9152987821', description: 'Free counseling by TISS professionals', language: 'English/Hindi' },
    { id: 2, category: 'crisis', title: 'Vandrevala Foundation', type: 'helpline', contact: '1860-2662-345', description: '24/7 mental health support', language: 'Multi-language' },
    { id: 3, category: 'crisis', title: 'NIMHANS', type: 'helpline', contact: '080-46110007', description: 'National Institute of Mental Health', language: 'English/Kannada' },
    { id: 4, category: 'anxiety', title: '5-4-3-2-1 Grounding Technique', type: 'technique', description: 'Engage your 5 senses to reduce anxiety', steps: ['Name 5 things you can see', 'Name 4 things you can touch', 'Name 3 things you can hear', 'Name 2 things you can smell', 'Name 1 thing you can taste'] },
    { id: 5, category: 'sleep', title: 'Sleep Hygiene Guide', type: 'guide', description: 'Tips for better sleep during exam season', tips: ['Consistent sleep schedule', 'No screens 1hr before bed', 'Cool, dark room', 'Avoid caffeine after 2pm'] },
    { id: 6, category: 'academic', title: 'Exam Anxiety Management', type: 'guide', description: 'Proven strategies for test anxiety' },
    { id: 7, category: 'mindfulness', title: 'Body Scan Meditation', type: 'exercise', duration: '10 mins', description: 'Progressive relaxation through body awareness' },
    { id: 8, category: 'social', title: 'Building Campus Connections', type: 'guide', description: 'Overcome loneliness and build meaningful relationships' }
  ];
  res.json({ success: true, data: resources });
});

module.exports = { communityRouter, wellnessRouter, crisisRouter, resourcesRouter };
