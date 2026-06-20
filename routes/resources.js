const router = require('express').Router();
const { protect } = require('../middleware/auth');

const RESOURCES = [
  { id: 1, category: 'crisis', title: 'iCall - Psychosocial Helpline', type: 'helpline', contact: '9152987821', description: 'Free counseling by TISS professionals. Mon-Sat 8am-10pm', language: 'English/Hindi', icon: '📞' },
  { id: 2, category: 'crisis', title: 'Vandrevala Foundation', type: 'helpline', contact: '1860-2662-345', description: '24/7 mental health crisis support across India', language: 'Multi-language', icon: '🆘' },
  { id: 3, category: 'crisis', title: 'NIMHANS Helpline', type: 'helpline', contact: '080-46110007', description: 'National Institute of Mental Health and Neurosciences', language: 'English/Kannada', icon: '🏥' },
  { id: 4, category: 'crisis', title: 'Snehi Foundation', type: 'helpline', contact: '044-24640050', description: 'Emotional support helpline', language: 'English/Tamil', icon: '💚' },
  { id: 5, category: 'anxiety', title: '5-4-3-2-1 Grounding Technique', type: 'technique', description: 'Engage all 5 senses to reduce anxiety in the moment', steps: ['Name 5 things you can SEE around you', 'Name 4 things you can TOUCH right now', 'Name 3 things you can HEAR', 'Name 2 things you can SMELL', 'Name 1 thing you can TASTE'], icon: '🧘' },
  { id: 6, category: 'anxiety', title: 'Box Breathing Technique', type: 'technique', description: '4-count breathing to calm the nervous system', steps: ['Inhale slowly for 4 counts', 'Hold your breath for 4 counts', 'Exhale slowly for 4 counts', 'Hold empty for 4 counts', 'Repeat 4-6 times'], icon: '⬛' },
  { id: 7, category: 'sleep', title: 'Student Sleep Hygiene Guide', type: 'guide', description: 'Evidence-based tips for quality sleep during academic stress', tips: ['Keep consistent sleep schedule (even weekends)', 'Stop screens 1 hour before bed', 'Keep room cool, dark and quiet', 'Avoid caffeine after 2pm', 'Create a pre-sleep relaxation routine', 'Avoid studying in bed'], icon: '😴' },
  { id: 8, category: 'academic', title: 'Exam Anxiety Management', type: 'guide', description: 'Science-backed strategies to manage test anxiety and perform better', tips: ['Prepare consistently, not last-minute', 'Practice past papers under timed conditions', 'Use deep breathing before and during exam', 'Focus on what you know, not what you don\'t', 'Reframe anxiety as excitement'], icon: '📚' },
  { id: 9, category: 'mindfulness', title: 'Body Scan Meditation', type: 'exercise', duration: '10-15 mins', description: 'Progressive relaxation through body awareness to release tension', icon: '🌊' },
  { id: 10, category: 'mindfulness', title: 'Mindful Walking Practice', type: 'exercise', duration: '10 mins', description: 'Turn a regular walk into a mindfulness practice for stress relief', icon: '🚶' },
  { id: 11, category: 'social', title: 'Building Campus Connections', type: 'guide', description: 'Practical strategies to overcome loneliness and build meaningful friendships', tips: ['Join one club or activity that genuinely interests you', 'Introduce yourself to one new person per week', 'Study in common areas instead of alone in your room', 'Attend campus events even briefly', 'Reach out to classmates about coursework'], icon: '🤝' },
  { id: 12, category: 'cbt', title: 'CBT Thought Journal Template', type: 'tool', description: 'Identify and challenge negative automatic thoughts using Cognitive Behavioral Therapy', steps: ['Identify the triggering situation', 'Write your automatic thought', 'Note the emotion and its intensity (0-100%)', 'Find the cognitive distortion (catastrophizing, all-or-nothing, etc.)', 'Write a balanced alternative thought', 'Rate your emotion intensity again'], icon: '💭' }
];

router.get('/', protect, async (req, res) => {
  const { category } = req.query;
  const data = category && category !== 'all' ? RESOURCES.filter(r => r.category === category) : RESOURCES;
  res.json({ success: true, data });
});

router.get('/helplines', protect, async (req, res) => {
  res.json({ success: true, data: RESOURCES.filter(r => r.type === 'helpline') });
});

module.exports = router;
