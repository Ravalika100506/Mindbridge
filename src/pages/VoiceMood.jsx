import { useState, useRef } from 'react';
import { API } from '../context/AuthContext';
import { Mic, MicOff, Volume2, Brain, Send, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MOOD_OPTIONS = [
  { value: 1, emoji: '😭', label: 'Terrible' },
  { value: 3, emoji: '😞', label: 'Bad' },
  { value: 5, emoji: '😐', label: 'Neutral' },
  { value: 7, emoji: '😊', label: 'Good' },
  { value: 9, emoji: '🤩', label: 'Amazing' },
];

const VOICE_CUES = [
  "How are you feeling today?",
  "Describe your current mood in a few words.",
  "What's been on your mind lately?",
  "Tell me about any stress you're experiencing.",
  "How did your day go?",
];

export default function VoiceMood() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [supported, setSupported] = useState(
    () => !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const [cue] = useState(() => VOICE_CUES[Math.floor(Math.random() * VOICE_CUES.length)]);
  const recognitionRef = useRef(null);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      toast.error('Speech recognition not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setRecording(true);
    recognition.onresult = (event) => {
      let final = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript + ' ';
      }
      if (final.trim()) setTranscript(final.trim());
    };
    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      if (e.error === 'not-allowed') toast.error('Microphone access denied. Please allow mic access.');
      else toast.error('Recording error. Please try again.');
      setRecording(false);
    };
    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const analyzeTranscript = async () => {
    if (!transcript.trim()) return toast.error('Please record something first');
    setAnalyzing(true);
    try {
      // Send transcript to AI chat for emotional analysis
      const res = await API.post('/ai/chat', {
        message: transcript,
        history: [],
        sessionContext: { name: '' }
      });

      // Also use stress predictor style for emotional analysis
      const sentimentWords = {
        positive: ['happy', 'great', 'good', 'excited', 'calm', 'peaceful', 'grateful', 'motivated', 'joy', 'love'],
        negative: ['sad', 'anxious', 'stressed', 'depressed', 'tired', 'overwhelmed', 'angry', 'scared', 'worried', 'hopeless']
      };
      const words = transcript.toLowerCase().split(/\s+/);
      let posScore = 0, negScore = 0;
      words.forEach(w => {
        if (sentimentWords.positive.some(p => w.includes(p))) posScore++;
        if (sentimentWords.negative.some(n => w.includes(n))) negScore++;
      });

      let detectedMood = 5;
      let emotion = 'neutral';
      if (posScore > negScore + 1) { detectedMood = 7 + Math.min(posScore, 3); emotion = 'positive'; }
      else if (negScore > posScore + 1) { detectedMood = 5 - Math.min(negScore, 4); emotion = 'negative'; }

      setAnalysis({
        aiResponse: res.data.reply,
        detectedMood: Math.max(1, Math.min(10, detectedMood)),
        emotion,
        crisisDetected: res.data.crisisDetected,
        sentiment: posScore > negScore ? 'positive' : negScore > posScore ? 'negative' : 'neutral'
      });

      if (res.data.crisisDetected) {
        toast.error('Crisis support is available. Please call iCall: 9152987821 💜', { duration: 8000 });
      }
    } catch {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const saveMoodFromVoice = async () => {
    if (!analysis) return;
    setSaving(true);
    try {
      await API.post('/mood', {
        mood: analysis.detectedMood,
        emoji: MOOD_OPTIONS.find(m => Math.abs(m.value - analysis.detectedMood) <= 1)?.emoji || '😐',
        label: analysis.emotion,
        note: transcript,
        tags: ['voice_entry'],
        academicLoad: 5,
        sleepHours: 7,
        exercised: false,
        socialInteraction: 5
      });
      setSaved(true);
      toast.success(`Mood logged! (${analysis.detectedMood}/10) +10 XP 🎉`);
    } catch {
      toast.error('Failed to save mood log');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setTranscript('');
    setAnalysis(null);
    setSaved(false);
    if (recording) stopRecording();
  };

  const EMOTION_COLORS = {
    positive: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', label: 'Positive 😊' },
    negative: { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.3)', label: 'Negative 😔' },
    neutral:  { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)', label: 'Neutral 😐' },
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl flex items-center gap-3">
          <Mic size={24} className="text-purple-400" /> Voice Mood Analysis
        </h1>
        <p className="text-gray-400 text-sm mt-1">Speak your feelings — AI will analyze your emotional tone and log your mood</p>
      </div>

      {!supported && (
        <div className="glass rounded-2xl p-4 border border-amber-500/20 flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm">Speech recognition requires Chrome, Edge, or Safari. Please switch browsers.</p>
        </div>
      )}

      {/* Prompt card */}
      <div className="glass rounded-2xl p-6 border border-purple-500/20 text-center">
        <Volume2 size={20} className="mx-auto text-purple-400 mb-3" />
        <p className="text-gray-400 text-sm mb-1">Prompt for you:</p>
        <p className="text-lg font-medium text-white italic">"{cue}"</p>
      </div>

      {/* Recording button */}
      <div className="flex flex-col items-center gap-5">
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={!supported || analyzing}
          className={`w-28 h-28 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
            recording
              ? 'bg-red-500 shadow-[0_0_40px_rgba(244,63,94,0.5)] scale-110'
              : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:scale-105 shadow-[0_0_30px_rgba(139,92,246,0.4)]'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {recording ? <MicOff size={40} /> : <Mic size={40} />}
        </button>
        <p className="text-gray-400 text-sm">
          {recording
            ? <span className="text-red-400 flex items-center gap-2"><span className="w-2 h-2 bg-red-400 rounded-full animate-pulse inline-block" /> Recording… click to stop</span>
            : 'Click to start recording'}
        </p>
      </div>

      {/* Transcript */}
      {(transcript || recording) && (
        <div className="glass rounded-2xl p-5 border border-white/10">
          <h3 className="text-xs text-gray-400 mb-2 flex items-center gap-2"><Mic size={11} /> Transcript</h3>
          <p className="text-gray-200 text-sm leading-relaxed min-h-[60px]">
            {transcript || <span className="text-gray-500 italic">Listening...</span>}
          </p>
          <div className="flex gap-2 mt-4 flex-wrap">
            <button onClick={analyzeTranscript} disabled={!transcript || analyzing || recording}
              className="btn-primary flex items-center gap-2 text-sm py-2 px-5 disabled:opacity-40">
              {analyzing ? <><RefreshCw size={14} className="animate-spin" /> Analyzing...</> : <><Brain size={14} /> Analyze Mood</>}
            </button>
            <button onClick={reset} className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
              <RefreshCw size={14} /> Reset
            </button>
          </div>
        </div>
      )}

      {/* Analysis result */}
      {analysis && (
        <div className="space-y-4 animate-fade-in">
          {/* Detected emotion */}
          <div className="glass rounded-2xl p-5 border" style={{
            borderColor: EMOTION_COLORS[analysis.emotion]?.border,
            background: EMOTION_COLORS[analysis.emotion]?.bg
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Brain size={14} style={{ color: EMOTION_COLORS[analysis.emotion]?.color }} />
                Detected Emotion
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                color: EMOTION_COLORS[analysis.emotion]?.color,
                background: 'rgba(0,0,0,0.2)',
                border: `1px solid ${EMOTION_COLORS[analysis.emotion]?.color}40`
              }}>
                {EMOTION_COLORS[analysis.emotion]?.label}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold" style={{ color: EMOTION_COLORS[analysis.emotion]?.color }}>
                {analysis.detectedMood}/10
              </div>
              <div className="flex-1">
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${analysis.detectedMood * 10}%`, background: EMOTION_COLORS[analysis.emotion]?.color }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Mood score from voice analysis</p>
              </div>
            </div>
          </div>

          {/* AI response */}
          <div className="glass rounded-2xl p-5 border border-purple-500/10">
            <h3 className="font-semibold text-sm text-purple-300 mb-3 flex items-center gap-2">
              <span className="text-base">🧠</span> Mira's Response
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">{analysis.aiResponse}</p>
          </div>

          {/* Crisis alert if detected */}
          {analysis.crisisDetected && (
            <div className="glass rounded-2xl p-4 border border-red-500/30 bg-red-500/5 flex items-center gap-3">
              <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-semibold text-sm">Crisis Support Available</p>
                <p className="text-gray-400 text-xs mt-0.5">iCall (free): <span className="text-red-300 font-bold">9152987821</span> · Vandrevala: <span className="text-red-300 font-bold">1860-2662-345</span></p>
              </div>
            </div>
          )}

          {/* Save button */}
          {!saved ? (
            <button onClick={saveMoodFromVoice} disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {saving ? <><RefreshCw size={16} className="animate-spin" /> Saving...</> : <><Send size={16} /> Save Mood Log (+10 XP)</>}
            </button>
          ) : (
            <div className="glass rounded-2xl p-4 border border-emerald-500/30 bg-emerald-500/5 text-center">
              <p className="text-emerald-300 font-semibold">✅ Mood logged successfully!</p>
              <button onClick={reset} className="btn-secondary text-sm mt-3 px-6">Analyse Another</button>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!transcript && !recording && (
        <div className="glass rounded-2xl p-5 border border-white/5">
          <h3 className="font-semibold text-sm mb-3 text-gray-300">How it works</h3>
          <ol className="space-y-2">
            {['Click the mic button and speak freely about how you feel', 'Click stop when done — your words appear as text', 'Click "Analyze Mood" — AI reads your emotional tone', 'Review the result and save it as a mood log (+10 XP)'].map((s, i) => (
              <li key={i} className="flex gap-2 items-start text-sm text-gray-400">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <p className="text-xs text-gray-500 mt-3">🎙️ Works best in Chrome or Edge. English (Indian accent) supported.</p>
        </div>
      )}
    </div>
  );
}
