const CRISIS_KEYWORDS = {
  critical: [
    'kill myself', 'want to die', 'end my life', 'suicide', 'suicidal',
    'i want to die', 'hurt myself', 'self harm', 'no reason to live',
    'better off dead', 'cant go on', "can't go on", 'give up on life',
    'ending it all', 'overdose', 'jump off'
  ],
  high: [
    'hopeless', 'worthless', 'no point', 'nobody cares', 'hate myself',
    'cutting', 'self-harm', 'can\'t cope', 'falling apart', 'breaking down',
    'nothing matters', 'not worth it', 'disappear forever', 'running away'
  ],
  medium: [
    'depressed', 'anxiety attack', 'panic attack', 'cant breathe',
    'overwhelmed', 'exhausted', 'burned out', 'stressed out', 'crying all day',
    'losing my mind', 'spiraling', 'can\'t function'
  ],
  low: [
    'sad', 'lonely', 'anxious', 'worried', 'stressed', 'struggling',
    'having a hard time', 'not doing well', 'feeling low'
  ]
};

const detectCrisis = (text) => {
  if (!text) return { detected: false, severity: null, keywords: [] };
  
  const lowerText = text.toLowerCase();
  const foundKeywords = [];
  let severity = null;

  for (const [level, keywords] of Object.entries(CRISIS_KEYWORDS)) {
    for (const kw of keywords) {
      if (lowerText.includes(kw)) {
        foundKeywords.push(kw);
        if (!severity || getSeverityScore(level) > getSeverityScore(severity)) {
          severity = level;
        }
      }
    }
  }

  return {
    detected: foundKeywords.length > 0,
    severity,
    keywords: [...new Set(foundKeywords)]
  };
};

const getSeverityScore = (severity) => {
  const scores = { low: 1, medium: 2, high: 3, critical: 4 };
  return scores[severity] || 0;
};

const analyzeSentiment = (text) => {
  if (!text) return 0;
  const positive = ['good', 'great', 'happy', 'amazing', 'wonderful', 'excited', 'love', 'joy', 'grateful', 'proud', 'calm', 'peaceful', 'better', 'hope'];
  const negative = ['bad', 'terrible', 'horrible', 'awful', 'hate', 'worst', 'never', 'failed', 'useless', 'stupid', 'ugly', 'wrong', 'pain', 'hurt'];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  words.forEach(word => {
    if (positive.includes(word)) score += 1;
    if (negative.includes(word)) score -= 1;
  });
  
  return Math.max(-1, Math.min(1, score / Math.max(words.length / 5, 1)));
};

module.exports = { detectCrisis, analyzeSentiment, CRISIS_KEYWORDS };
