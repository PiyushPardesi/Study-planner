import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Brain, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

// Notice we added "onTick" here!
export default function PomodoroTimer({ onTick }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); 

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
        
        // Every second you are focusing, tell the parent component!
        if (mode === 'focus' && onTick) {
          onTick();
        }
        
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      alert(mode === 'focus' ? "Focus session complete! Take a break." : "Break is over! Back to work.");
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, onTick]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };
  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-0 left-0 h-1 bg-gray-100 w-full">
        <motion.div 
          className={`h-full ${mode === 'focus' ? 'bg-blue-600' : 'bg-emerald-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>

      <div className="w-full flex justify-between items-center mb-6 mt-2">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          {mode === 'focus' ? <Brain size={16} className="text-blue-600" /> : <Coffee size={16} className="text-emerald-500" />}
          {mode === 'focus' ? 'Deep Focus' : 'Take a Break'}
        </h3>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => switchMode('focus')} className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${mode === 'focus' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Focus</button>
          <button onClick={() => switchMode('break')} className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${mode === 'break' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}>Break</button>
        </div>
      </div>

      {/* Reduced from text-6xl to text-5xl for the sidebar */}
      <div className="text-5xl font-black text-gray-900 tracking-tighter mb-8 font-mono">
        {formatTime(timeLeft)}
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTimer}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-white transition-all shadow-md active:scale-95 text-sm ${
            mode === 'focus' ? (isActive ? 'bg-blue-700' : 'bg-blue-600') : (isActive ? 'bg-emerald-600' : 'bg-emerald-500')
          }`}
        >
          {isActive ? <Pause size={18} /> : <Play size={18} />}
          {isActive ? 'Pause' : 'Start'}
        </button>
        
        <button onClick={resetTimer} className="p-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-2xl transition-all">
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}