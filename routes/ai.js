const router = require('express').Router();
const Groq = require('groq-sdk');
const { protect } = require('../middleware/auth');
const { detectCrisis } = require('../config/crisisDetection');
const { CrisisAlert } = require('../models/Community');

const MODEL = 'llama-3.3-70b-versatile';
const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

// @POST /api/ai/chat
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, history = [], sessionContext = {} } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const crisisResult = detectCrisis(message);
    if (crisisResult.detected && ['high', 'critical'].includes(crisisResult.severity)) {
      await CrisisAlert.create({
        user: req.user._id, source: 'chat',
        severity: crisisResult.severity, triggerText: message, keywords: crisisResult.keywords
      });
      return res.json({
        success: true,
        reply: `I'm really concerned about what you've shared. Your safety is the most important thing right now.\n\n**Please reach out for immediate help:**\n- iCall (India): **9152987821**\n- Vandrevala Foundation: **1860-2662-345** (24/7)\n- NIMHANS: **080-46110007**\n\nI'm here with you. Would you like to talk about what's happening?`,
        crisisDetected: true, severity: crisisResult.severity
      });
    }

    const systemPrompt = `You are Mira, a compassionate AI mental health companion for college students on MindBridge.

Your role: provide empathetic, non-judgmental support using CBT, DBT, mindfulness approaches. Help with academic stress, anxiety, loneliness, daily challenges. Encourage professional help when needed — never replace therapists.

Student context:${sessionContext.name ? ` Name: ${sessionContext.name}.` : ''}${sessionContext.university ? ` University: ${sessionContext.university}.` : ''}${sessionContext.recentMood ? ` Recent mood: ${sessionContext.recentMood}/10.` : ''}

Rules: Keep responses warm and conversational (2-4 paragraphs). Ask follow-up questions. Suggest practical coping strategies. Never diagnose. If crisis, give Indian helpline numbers. Use emojis occasionally.`;

    const messages = [
      ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const completion = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 600,
      temperature: 0.75
    });

    const reply = completion.choices[0]?.message?.content || "I'm here to listen. Please tell me more. 💜";
    res.json({ success: true, reply, crisisDetected: false });
  } catch (err) {
    console.error('AI Chat error:', err.message);
    res.status(500).json({ error: 'AI service unavailable. Please try again.' });
  }
});

// @POST /api/ai/analyze-journal
router.post('/analyze-journal', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    const prompt = `Analyze this student's journal entry. Return ONLY valid JSON (no markdown, no backticks):
{"themes":["theme1","theme2","theme3"],"insight":"2-3 warm empathetic sentences","copingStrategies":["strategy1","strategy2","strategy3"],"positiveReframe":"one strength or reframe","followUpQuestion":"one reflective question"}

Journal entry: "${content.substring(0, 800)}"`;

    const completion = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.5
    });

    let analysis;
    try {
      const raw = (completion.choices[0]?.message?.content || '{}').replace(/```json|```/g, '').trim();
      analysis = JSON.parse(raw);
      if (!analysis.themes) throw new Error('Invalid structure');
    } catch {
      analysis = {
        themes: ['self-reflection', 'emotional-processing', 'growth'],
        insight: 'Your willingness to reflect shows strength and self-awareness. Taking time to write about your experiences is a powerful act of self-care.',
        copingStrategies: ['Practice 5 minutes of deep breathing when stressed', 'Talk to a trusted friend or counselor', 'Take a short mindful walk outside'],
        positiveReframe: "You're taking steps to understand yourself — that takes real courage.",
        followUpQuestion: 'What one small step could you take tomorrow to feel a little better?'
      };
    }
    res.json({ success: true, data: analysis });
  } catch (err) {
    console.error('AI Journal analysis error:', err.message);
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

// @POST /api/ai/stress-predictor
router.post('/stress-predictor', protect, async (req, res) => {
  try {
    const { upcomingEvents, recentMoods, sleepAvg, exerciseFrequency } = req.body;

    const prompt = `Academic stress analyst. Student data:
- Upcoming events: ${JSON.stringify(upcomingEvents || [])}
- Recent avg mood (1-10): ${recentMoods || 5}
- Avg sleep: ${sleepAvg || 7}h
- Exercise: ${exerciseFrequency || 2} days/week

Return ONLY valid JSON (no markdown):
{"stressRisk":"low","stressScore":4,"riskFactors":["factor1"],"protectiveFactors":["factor1"],"recommendations":["rec1","rec2","rec3"],"shortMessage":"Two supportive sentences."}`;

    const completion = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.3
    });

    let prediction;
    try {
      const raw = (completion.choices[0]?.message?.content || '{}').replace(/```json|```/g, '').trim();
      prediction = JSON.parse(raw);
      if (!prediction.stressRisk) throw new Error('Invalid');
    } catch {
      prediction = {
        stressRisk: 'medium', stressScore: 5,
        riskFactors: ['Multiple upcoming deadlines'],
        protectiveFactors: ['Regular self-check-ins'],
        recommendations: ['Break tasks into small steps', 'Prioritize sleep (7-8h)', 'Schedule short study breaks'],
        shortMessage: "You're managing a lot right now. Take it one step at a time — you've got this."
      };
    }
    res.json({ success: true, data: prediction });
  } catch (err) {
    console.error('Stress predictor error:', err.message);
    res.status(500).json({ error: 'Stress prediction failed.' });
  }
});



// @POST /api/ai/routine-planner  — Smart Routine Planner
router.post('/routine-planner', protect, async (req, res) => {
  try {
    const { wakeTime, bedTime, classes, studyHours, exercisePreference, avgMoodScore } = req.body;

    const prompt = `You are a smart academic routine planner for college students. Create a personalized daily schedule.

Student data:
- Wake time: ${wakeTime || '7:00 AM'}
- Bed time: ${bedTime || '11:00 PM'}
- Classes per day: ${classes || 3}
- Preferred study hours/day: ${studyHours || 4}
- Exercise preference: ${exercisePreference || 'light'}
- Recent avg mood score (1-10): ${avgMoodScore || 5}

Return ONLY valid JSON (no markdown):
{
  "schedule": [
    {"time": "7:00 AM", "activity": "Wake up & hydrate", "duration": 15, "category": "wellness", "icon": "🌅"},
    {"time": "7:15 AM", "activity": "Morning journaling", "duration": 10, "category": "mindfulness", "icon": "📓"}
  ],
  "studyTips": ["tip1", "tip2", "tip3"],
  "breakReminders": ["Every 45 min take a 5-min break", "Lunch away from screens"],
  "sleepTip": "One sentence sleep hygiene tip",
  "motivationalNote": "Short personalized encouragement"
}`;

    const completion = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.4
    });

    let routine;
    try {
      const raw = (completion.choices[0]?.message?.content || '{}').replace(/```json|```/g, '').trim();
      routine = JSON.parse(raw);
      if (!routine.schedule) throw new Error('Invalid');
    } catch {
      routine = {
        schedule: [
          { time: '7:00 AM', activity: 'Wake up & hydrate', duration: 15, category: 'wellness', icon: '🌅' },
          { time: '7:15 AM', activity: 'Morning meditation', duration: 10, category: 'mindfulness', icon: '🧘' },
          { time: '8:00 AM', activity: 'Breakfast', duration: 30, category: 'nutrition', icon: '🍳' },
          { time: '9:00 AM', activity: 'Classes / Study block 1', duration: 90, category: 'academic', icon: '📚' },
          { time: '10:30 AM', activity: 'Short break + stretch', duration: 10, category: 'wellness', icon: '🤸' },
          { time: '2:00 PM', activity: 'Lunch + rest', duration: 60, category: 'nutrition', icon: '🥗' },
          { time: '4:00 PM', activity: 'Exercise / Walk', duration: 30, category: 'exercise', icon: '🏃' },
          { time: '6:00 PM', activity: 'Study block 2', duration: 90, category: 'academic', icon: '📖' },
          { time: '8:00 PM', activity: 'Dinner & wind down', duration: 60, category: 'nutrition', icon: '🍽️' },
          { time: '9:30 PM', activity: 'Journal or creative time', duration: 30, category: 'mindfulness', icon: '✍️' },
          { time: '10:30 PM', activity: 'Sleep routine — screens off', duration: 30, category: 'wellness', icon: '🌙' }
        ],
        studyTips: ['Use the Pomodoro technique: 45 min study, 5 min break', 'Review notes within 24 hours of class', 'Study hardest subjects when energy is highest'],
        breakReminders: ['Every 45 minutes, take a 5-minute movement break', 'Have lunch away from your study space', 'Afternoon walk boosts focus and mood'],
        sleepTip: 'Aim for 7-8 hours — sleep consolidates memory and reduces anxiety significantly.',
        motivationalNote: "Consistency beats intensity. Even small study sessions add up over time. You've got this! 💪"
      };
    }
    res.json({ success: true, data: routine });
  } catch (err) {
    console.error('Routine planner error:', err.message);
    res.status(500).json({ error: 'Routine planning failed.' });
  }
});

// @POST /api/ai/recommendations — Personalized Recommendation Engine
router.post('/recommendations', protect, async (req, res) => {
  try {
    const { avgMood, topTags, sleepAvg, streakDays, recentJournalThemes, lastBreathingSession } = req.body;

    const prompt = `You are a mental wellness recommendation engine for college students. Based on the data below, generate hyper-personalized recommendations.

User data:
- Avg mood (1-10): ${avgMood || 5}
- Top mood triggers/tags: ${JSON.stringify(topTags || [])}
- Avg sleep hours: ${sleepAvg || 7}
- Current streak days: ${streakDays || 0}
- Recent journal themes: ${JSON.stringify(recentJournalThemes || [])}
- Days since last breathing session: ${lastBreathingSession || 'unknown'}

Return ONLY valid JSON (no markdown):
{
  "activities": [{"title": "Activity name", "description": "Why this helps them specifically", "duration": "10 mins", "icon": "🧘", "category": "mindfulness"}],
  "resources": [{"title": "Resource name", "reason": "Why recommended", "type": "article|video|technique", "link": "/resources"}],
  "exercises": [{"name": "Exercise name", "benefit": "Specific mental health benefit", "duration": "5 mins"}],
  "affirmation": "Personalized affirmation based on their data",
  "weeklyChallenge": {"title": "Challenge name", "description": "What to do", "xpReward": 50}
}
Provide exactly 3 activities, 2 resources, 2 exercises.`;

    const completion = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 700,
      temperature: 0.5
    });

    let recommendations;
    try {
      const raw = (completion.choices[0]?.message?.content || '{}').replace(/```json|```/g, '').trim();
      recommendations = JSON.parse(raw);
      if (!recommendations.activities) throw new Error('Invalid');
    } catch {
      recommendations = {
        activities: [
          { title: '5-minute Box Breathing', description: 'Helps regulate your nervous system during stress', duration: '5 mins', icon: '🌬️', category: 'mindfulness' },
          { title: 'Gratitude Journaling', description: 'Writing 3 gratitudes shifts focus to positives', duration: '10 mins', icon: '📓', category: 'journaling' },
          { title: 'Campus Nature Walk', description: 'Green spaces reduce cortisol and boost mood', duration: '20 mins', icon: '🌿', category: 'exercise' }
        ],
        resources: [
          { title: 'Exam Anxiety Management', reason: 'Academic stress detected in recent mood logs', type: 'technique', link: '/resources' },
          { title: 'Sleep Hygiene Guide', reason: 'Sleep improvement can boost your mood score significantly', type: 'guide', link: '/resources' }
        ],
        exercises: [
          { name: 'Progressive Muscle Relaxation', benefit: 'Releases physical tension from study sessions', duration: '10 mins' },
          { name: 'Mindful Breathing', benefit: 'Reduces anxiety and improves focus', duration: '5 mins' }
        ],
        affirmation: "You're showing up for yourself every day — that takes real strength. Keep going. 💜",
        weeklyChallenge: { title: 'Mood Consistency Challenge', description: 'Log your mood every day this week and reflect on patterns', xpReward: 50 }
      };
    }
    res.json({ success: true, data: recommendations });
  } catch (err) {
    console.error('Recommendations error:', err.message);
    res.status(500).json({ error: 'Recommendations failed.' });
  }
});

// @POST /api/ai/emotion — NLP Emotion Detection
router.post('/emotion', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 5) return res.status(400).json({ error: 'Text too short' });

    const prompt = `You are an expert emotion analysis AI trained in NLP and psychology. Analyze the emotional content of the following text from a student.

Text: "${text.substring(0, 800)}"

Return ONLY valid JSON (no markdown, no backticks, no preamble):
{
  "primaryEmotion": "happy|sad|anxious|angry|stressed|neutral|hopeful|lonely|overwhelmed|excited",
  "confidence": 85,
  "emotionBreakdown": {"stressed": 65, "anxious": 25, "sad": 10},
  "intensity": "mild|moderate|high",
  "themes": ["academic pressure", "sleep issues"],
  "insight": "2-3 warm empathetic sentences acknowledging their feelings",
  "copingStrategies": ["strategy 1", "strategy 2", "strategy 3"],
  "suggestedAction": "one concrete next step they can take right now",
  "riskLevel": "none|low|medium|high"
}
- emotionBreakdown: up to 4 emotions, values must sum to 100
- primaryEmotion must be one of the listed options exactly
- insight must be warm, non-judgmental, and specific to their situation`;

    const completion = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.3
    });

    let analysis;
    try {
      const raw = (completion.choices[0]?.message?.content || '{}').replace(/```json|```/g, '').trim();
      analysis = JSON.parse(raw);
      if (!analysis.primaryEmotion) throw new Error('Invalid');
    } catch {
      analysis = {
        primaryEmotion: 'neutral', confidence: 60,
        emotionBreakdown: { neutral: 60, stressed: 25, anxious: 15 },
        intensity: 'mild', themes: ['self-reflection'],
        insight: "Thank you for sharing your thoughts. What you're feeling is valid and it takes courage to put your feelings into words. You're not alone in this.",
        copingStrategies: ['Take a few slow deep breaths', 'Write about what is weighing on you', 'Reach out to someone you trust'],
        suggestedAction: 'Try a 3-minute breathing exercise to ground yourself.',
        riskLevel: 'none'
      };
    }

    // Crisis check
    const { detectCrisis } = require('../config/crisisDetection');
    const crisisResult = detectCrisis(text);
    if (crisisResult.detected && ['high', 'critical'].includes(crisisResult.severity)) {
      const { CrisisAlert } = require('../models/Community');
      await CrisisAlert.create({
        user: req.user._id, source: 'ai_detected',
        severity: crisisResult.severity, triggerText: text.substring(0, 200), keywords: crisisResult.keywords
      });
      analysis.riskLevel = 'high';
      analysis.crisisDetected = true;
    }

    res.json({ success: true, data: analysis });
  } catch (err) {
    console.error('Emotion detection error:', err.message);
    res.status(500).json({ error: 'Emotion analysis failed. Please try again.' });
  }
});

module.exports = router;
