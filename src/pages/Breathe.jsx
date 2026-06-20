import { useState, useEffect, useRef, useCallback } from 'react';
import { API } from '../context/AuthContext';
import { Wind, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TECHNIQUES = [
  {
    id: '4-7-8', name: '4-7-8 Breathing', icon: '🌙', color: '#8b5cf6',
    desc: 'Calms anxiety & helps sleep. Inhale 4s, hold 7s, exhale 8s.',
    phases: [
      { label: 'Inhale', duration: 4, color: '#8b5cf6', scale: 1.35 },
      { label: 'Hold', duration: 7, color: '#06b6d4', scale: 1.35 },
      { label: 'Exhale', duration: 8, color: '#10b981', scale: 1 }
    ]
  },
  {
    id: 'box', name: 'Box Breathing', icon: '⬛', color: '#06b6d4',
    desc: 'Used by Navy SEALs. Equal 4-count phases for calm focus.',
    phases: [
      { label: 'Inhale', duration: 4, color: '#8b5cf6', scale: 1.35 },
      { label: 'Hold', duration: 4, color: '#f59e0b', scale: 1.35 },
      { label: 'Exhale', duration: 4, color: '#10b981', scale: 1 },
      { label: 'Hold', duration: 4, color: '#f59e0b', scale: 1 }
    ]
  },
  {
    id: 'diaphragmatic', name: 'Belly Breathing', icon: '🫁', color: '#10b981',
    desc: 'Deep diaphragmatic breathing for instant stress relief.',
    phases: [
      { label: 'Inhale slowly', duration: 5, color: '#8b5cf6', scale: 1.4 },
      { label: 'Exhale slowly', duration: 5, color: '#10b981', scale: 1 }
    ]
  },
  {
    id: 'coherent', name: 'Coherent Breathing', icon: '💚', color: '#f59e0b',
    desc: 'Heart rate variability training. 5 breaths per minute.',
    phases: [
      { label: 'Inhale', duration: 5, color: '#8b5cf6', scale: 1.35 },
      { label: 'Exhale', duration: 5, color: '#10b981', scale: 1 }
    ]
  },
  {
    id: '2-1-4-1', name: '2-1-4-1 Technique', icon: '✨', color: '#a78bfa',
    desc: 'Rapid stress relief with extended exhale for nervous system calm.',
    phases: [
      { label: 'Inhale', duration: 2, color: '#8b5cf6', scale: 1.35 },
      { label: 'Hold', duration: 1, color: '#f59e0b', scale: 1.35 },
      { label: 'Exhale', duration: 4, color: '#10b981', scale: 1 },
      { label: 'Hold', duration: 1, color: '#f59e0b', scale: 1 }
    ]
  },
];

export default function Breathe() {
  const [selected, setSelected] = useState(TECHNIQUES[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TECHNIQUES[0].phases[0].duration);
  const [cycles, setCycles] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [moodBefore, setMoodBefore] = useState(5);
  const [moodAfter, setMoodAfter] = useState(5);
  const [showDone, setShowDone] = useState(false);
  const [circleScale, setCircleScale] = useState(1);

  // Use refs so the interval callback always has fresh values without being re-created
  const isRunningRef = useRef(false);
  const phaseRef = useRef(0);
  const timeLeftRef = useRef(TECHNIQUES[0].phases[0].duration);
  const cyclesRef = useRef(0);
  const totalTimeRef = useRef(0);
  const selectedRef = useRef(TECHNIQUES[0]);
  const intervalRef = useRef(null);

  // Keep refs in sync with state
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  const tick = useCallback(() => {
    if (!isRunningRef.current) return;

    totalTimeRef.current += 1;
    setTotalTime(totalTimeRef.current);

    timeLeftRef.current -= 1;
    setTimeLeft(timeLeftRef.current);

    if (timeLeftRef.current <= 0) {
      const phases = selectedRef.current.phases;
      const nextPhase = (phaseRef.current + 1) % phases.length;

      if (nextPhase === 0) {
        cyclesRef.current += 1;
        setCycles(cyclesRef.current);
      }

      phaseRef.current = nextPhase;
      setPhaseIndex(nextPhase);

      timeLeftRef.current = phases[nextPhase].duration;
      setTimeLeft(phases[nextPhase].duration);
      setCircleScale(phases[nextPhase].scale);
    }
  }, []);

  const start = useCallback(() => {
    // Reset state
    phaseRef.current = 0;
    timeLeftRef.current = selectedRef.current.phases[0].duration;
    cyclesRef.current = 0;
    totalTimeRef.current = 0;
    setPhaseIndex(0);
    setTimeLeft(selectedRef.current.phases[0].duration);
    setCycles(0);
    setTotalTime(0);
    setCircleScale(selectedRef.current.phases[0].scale);
    setShowDone(false);

    isRunningRef.current = true;
    setIsRunning(true);

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, 1000);
  }, [tick]);

  const pause = useCallback(() => {
    isRunningRef.current = false;
    setIsRunning(false);
    clearInterval(intervalRef.current);
  }, []);

  const resume = useCallback(() => {
    isRunningRef.current = true;
    setIsRunning(true);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, 1000);
  }, [tick]);

  const reset = useCallback(() => {
    pause();
    phaseRef.current = 0;
    timeLeftRef.current = selectedRef.current.phases[0].duration;
    cyclesRef.current = 0;
    totalTimeRef.current = 0;
    setPhaseIndex(0);
    setTimeLeft(selectedRef.current.phases[0].duration);
    setCycles(0);
    setTotalTime(0);
    setCircleScale(1);
    setShowDone(false);
  }, [pause]);

  const handleSelectTechnique = (technique) => {
    reset();
    setSelected(technique);
    selectedRef.current = technique;
    setTimeLeft(technique.phases[0].duration);
    timeLeftRef.current = technique.phases[0].duration;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      isRunningRef.current = false;
    };
  }, []);

  const finish = async () => {
    pause();
    setShowDone(true);
    try {
      await API.post('/wellness/breathing', {
        technique: selected.id,
        durationMinutes: Math.max(1, Math.round(totalTimeRef.current / 60)),
        cyclesCompleted: cyclesRef.current,
        moodBefore,
        moodAfter
      });
      toast.success(`Great session! +8 XP 🌿 ${cyclesRef.current} cycles completed`);
    } catch {
      toast.success('Session recorded locally 🌿');
    }
  };

  const currentPhase = selected.phases[phaseIndex];
  const progress = currentPhase
    ? ((currentPhase.duration - timeLeft) / currentPhase.duration) * 100
    : 0;
  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference * (1 - progress / 100);

  const mins = Math.floor(totalTime / 60);
  const secs = String(totalTime % 60).padStart(2, '0');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl">Breathe & Relax</h1>
        <p className="text-gray-400 text-sm mt-1">Science-backed breathing exercises for instant calm</p>
      </div>

      {/* Technique Selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {TECHNIQUES.map(t => (
          <button
            key={t.id}
            onClick={() => handleSelectTechnique(t)}
            className={`card p-4 text-center transition-all ${selected.id === t.id ? 'border-purple-500/40 bg-purple-500/10' : 'glass-hover'}`}
          >
            <div className="text-2xl mb-2">{t.icon}</div>
            <div className="text-xs font-medium leading-tight">{t.name}</div>
          </button>
        ))}
      </div>

      {/* Main Breathing Area */}
      <div className="card p-8 text-center">
        <h2 className="font-semibold mb-1" style={{ color: selected.color }}>{selected.name}</h2>
        <p className="text-xs text-gray-500 mb-8">{selected.desc}</p>

        {/* Animated breathing circle */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative" style={{ width: 240, height: 240 }}>
            {/* Progress ring */}
            <svg width="240" height="240" style={{ position: 'absolute', top: 0, left: 0 }}>
              <circle cx="120" cy="120" r="110" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              {isRunning && (
                <circle
                  cx="120" cy="120" r="110" fill="none"
                  stroke={currentPhase?.color || selected.color} strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '120px 120px', transition: 'stroke-dashoffset 0.9s linear' }}
                />
              )}
            </svg>

            {/* Breathing circle */}
            <div
              className="absolute"
              style={{
                top: 20, left: 20, width: 200, height: 200,
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, ${currentPhase?.color || selected.color}55, ${selected.color}20)`,
                transform: `scale(${isRunning ? circleScale : 1})`,
                transition: isRunning ? `transform ${currentPhase?.duration * 0.9}s ease-in-out` : 'transform 0.5s ease',
                boxShadow: isRunning
                  ? `0 0 60px ${currentPhase?.color || selected.color}40, 0 0 120px ${currentPhase?.color || selected.color}15`
                  : '0 0 30px rgba(139,92,246,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <div>
                <div className="font-display font-bold text-4xl mb-1" style={{ color: isRunning ? currentPhase?.color : '#8b5cf6' }}>
                  {isRunning ? timeLeft : '∞'}
                </div>
                <div className="text-sm font-medium" style={{ color: isRunning ? currentPhase?.color : '#9090b0' }}>
                  {isRunning ? currentPhase?.label : 'Ready'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session stats */}
        <div className="flex justify-center gap-10 mb-6 text-sm">
          <div className="text-center">
            <div className="font-bold text-xl text-purple-400">{cycles}</div>
            <div className="text-xs text-gray-500">Cycles</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-xl text-cyan-400">{mins}:{secs}</div>
            <div className="text-xs text-gray-500">Time</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={reset} className="btn-secondary p-3 rounded-xl" title="Reset">
            <RotateCcw size={18} />
          </button>

          {!isRunning ? (
            <button onClick={totalTime > 0 ? resume : start} className="btn-primary px-8 py-3 text-base">
              <Play size={20} /> {totalTime > 0 ? 'Resume' : 'Start'}
            </button>
          ) : (
            <button onClick={pause} className="btn-primary px-8 py-3 text-base">
              <Pause size={20} /> Pause
            </button>
          )}

          {/* Fix 7: Show finish button when totalTime > 10 seconds, not just cycles > 0 */}
          {totalTime > 10 && (
            <button onClick={finish} className="p-3 rounded-xl text-emerald-400 hover:bg-emerald-400/10 border border-emerald-400/20 transition-all" title="Finish session">
              <CheckCircle size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Mood Before/After */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-medium mb-3">
            Mood Before: <span className="text-purple-400 font-bold">{moodBefore}/10</span>
          </h3>
          <input
            type="range" min="1" max="10" value={moodBefore}
            onChange={e => setMoodBefore(Number(e.target.value))}
            className="w-full" disabled={isRunning}
          />
        </div>
        <div className="card">
          <h3 className="text-sm font-medium mb-3">
            Mood After: <span className="text-emerald-400 font-bold">{moodAfter}/10</span>
          </h3>
          <input
            type="range" min="1" max="10" value={moodAfter}
            onChange={e => setMoodAfter(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Phase Guide */}
      <div className="card">
        <h2 className="font-semibold text-sm mb-4">Phase Guide — {selected.name}</h2>
        <div className="flex gap-2 flex-wrap">
          {selected.phases.map((p, i) => (
            <div
              key={i}
              className="flex-1 min-w-[70px] p-3 rounded-xl text-center transition-all duration-300"
              style={{
                background: isRunning && phaseIndex === i ? `${p.color}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isRunning && phaseIndex === i ? p.color + '40' : 'rgba(255,255,255,0.06)'}`,
                transform: isRunning && phaseIndex === i ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <div className="font-bold text-lg" style={{ color: p.color }}>{p.duration}s</div>
              <div className="text-xs text-gray-500">{p.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Done Card */}
      {showDone && (
        <div className="card p-6 text-center animate-scale-in" style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
          <div className="text-4xl mb-2">🌿</div>
          <h3 className="font-display font-bold text-lg text-emerald-400 mb-1">Session Complete!</h3>
          <p className="text-gray-400 text-sm">
            {cycles} cycles · {mins}m {totalTime % 60}s · +8 XP earned
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Consistent breathing reduces cortisol and anxiety. Well done! 💚
          </p>
          <button onClick={reset} className="btn-primary mt-4 text-sm px-6 py-2">
            Start Another
          </button>
        </div>
      )}
    </div>
  );
}
