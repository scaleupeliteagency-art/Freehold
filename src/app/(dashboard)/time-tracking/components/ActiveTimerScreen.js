"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Play, Pause, RotateCcw, Maximize, Minimize, Square, ClipboardList, Music, PenTool, Flame, Leaf, Home, Lightbulb, Gift, Settings, X } from "lucide-react";

const QUOTES = [
  "Don't limit your dreams, chase them.",
  "Productivity is never an accident.",
  "Focus on being productive instead of busy.",
  "Time is more valuable than money.",
  "Amateurs sit and wait for inspiration.",
  "Action is the foundational key to all success.",
  "The way to get started is to quit talking and begin doing."
];

export default function ActiveTimerScreen({ activeTimer, inputName, onStop }) {
  const [elapsed, setElapsed] = useState(0);
  const [quote, setQuote] = useState(QUOTES[0]);
  const [mode, setMode] = useState("focus"); 
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseOffset, setPauseOffset] = useState(0); 
  const [lastPauseTime, setLastPauseTime] = useState(null);
  
  // New State for Toolbar Features
  const [activeWidget, setActiveWidget] = useState(null); // 'tasks', 'music', 'notes', 'settings'
  const [notes, setNotes] = useState("");
  const [tasks, setTasks] = useState([{ id: 1, text: "Focus on primary task", done: false }]);
  const [newTask, setNewTask] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false); // Lightbulb toggles this

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const quoteInterval = setInterval(() => {
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }, 60000);
    return () => clearInterval(quoteInterval);
  }, []);

  useEffect(() => {
    let interval = null;
    if (activeTimer && !isPaused) {
      interval = setInterval(() => {
        const totalElapsed = Math.floor((new Date() - activeTimer.startTime) / 1000);
        setElapsed(totalElapsed - pauseOffset);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer, isPaused, pauseOffset]);

  const handlePauseToggle = () => {
    if (isPaused) {
      const pausedFor = Math.floor((new Date() - lastPauseTime) / 1000);
      setPauseOffset(prev => prev + pausedFor);
      setIsPaused(false);
      setLastPauseTime(null);
    } else {
      setIsPaused(true);
      setLastPauseTime(new Date());
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const getDisplayTime = () => {
    if (mode === "stopwatch") return elapsed;
    const targets = { focus: 1500, shortBreak: 300, longBreak: 900 };
    const target = targets[mode];
    return Math.max(0, target - elapsed);
  };

  const displaySeconds = getDisplayTime();

  useEffect(() => {
    if (mode !== "stopwatch" && displaySeconds === 0 && activeTimer && !isPaused) {
      handleFinish();
    }
  }, [displaySeconds, mode, activeTimer, isPaused]);
  
  const h = Math.floor(displaySeconds / 3600);
  const m = Math.floor((displaySeconds % 3600) / 60);
  const s = displaySeconds % 60;

  let timeString = h > 0 
    ? `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  const handleFinish = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onStop();
  };

  const handleReset = () => {
    const totalElapsed = Math.floor((new Date() - activeTimer.startTime) / 1000);
    setPauseOffset(totalElapsed);
    setElapsed(0);
    if (isPaused) {
      setLastPauseTime(new Date());
    }
  };

  const toggleWidget = (widget) => {
    setActiveWidget(activeWidget === widget ? null : widget);
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]);
    setNewTask("");
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const themeClasses = isDarkMode 
    ? "bg-ink text-white selection:bg-ochre/30" 
    : "bg-paper text-ink selection:bg-ochre/20";
    
  const boxClasses = isDarkMode
    ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/15 hover:text-white"
    : "bg-black/5 border-black/10 text-ink-muted hover:bg-black/10 hover:text-ink";

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col font-sans transition-colors duration-500 ${themeClasses}`}>
      
      {/* Top Header */}
      <div className="flex justify-between items-start p-8 md:p-12 w-full absolute top-0 left-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center">
            <Image src="/assets/logo1.png" alt="Working Ledger" width={150} height={40} className="object-contain" />
          </div>
          <span className="text-[10px] text-ochre tracking-widest uppercase font-bold mt-1 px-3 py-1 rounded-full border border-ochre/20 bg-ochre/10">Focus Mode</span>
        </div>
        <div className="max-w-xs text-right hidden sm:block">
          <p className={`text-lg font-medium italic ${isDarkMode ? 'text-white/80' : 'text-ink-muted'}`}>"{quote}"</p>
        </div>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-6 mt-12">
        
        <h2 className={`text-3xl md:text-4xl font-semibold mb-8 text-center tracking-tight ${isDarkMode ? 'text-white/90' : 'text-ink'}`}>
          {inputName}
        </h2>

        {/* Mode Selector */}
        <div className={`flex items-center gap-2 p-1.5 rounded-full mb-6 backdrop-blur-md shadow-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}>
          {["focus", "shortBreak", "longBreak", "stopwatch"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); handleReset(); }}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                mode === m 
                  ? 'bg-ochre text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]' 
                  : (isDarkMode ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-ink-muted hover:text-ink hover:bg-black/5')
              }`}
            >
              {m === "focus" ? "Focus" : m === "shortBreak" ? "Short Break" : m === "longBreak" ? "Long Break" : "Stopwatch"}
            </button>
          ))}
        </div>

        {/* Huge Timer */}
        <div className={`text-[25vw] md:text-[15rem] font-bold tracking-tighter leading-none tabular-nums drop-shadow-2xl ${isDarkMode ? 'text-white' : 'text-ink'}`}>
          {timeString}
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-4 mt-12">
          <button 
            onClick={handlePauseToggle}
            className={`px-10 py-4 rounded-full text-lg font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl ${isDarkMode ? 'bg-white text-ink' : 'bg-ink text-white'}`}
          >
            {isPaused ? <Play className="w-5 h-5 fill-current text-ochre" /> : <Pause className="w-5 h-5 fill-current text-ochre" />}
            {isPaused ? "Resume" : "Pause"}
          </button>
          
          <button 
            onClick={handleReset}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${boxClasses}`}
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button 
            onClick={handleFinish}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/20 hover:bg-red-500/30' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
            title="Finish Session & Log Time"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>

      {/* Widgets Overlay */}
      {activeWidget && (
        <div className={`absolute bottom-28 left-8 w-80 p-5 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-bottom-5 ${isDarkMode ? 'bg-ink/90 border-white/10' : 'bg-white/90 border-black/10'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold uppercase tracking-wider text-sm">{activeWidget}</h3>
            <button onClick={() => setActiveWidget(null)} className="opacity-50 hover:opacity-100"><X size={16}/></button>
          </div>
          
          {activeWidget === 'notes' && (
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full h-40 p-3 rounded-xl resize-none outline-none ${isDarkMode ? 'bg-white/5 text-white' : 'bg-black/5 text-ink'}`}
              placeholder="Jot down some quick thoughts..."
            />
          )}

          {activeWidget === 'tasks' && (
            <div className="flex flex-col gap-3">
              <div className="max-h-40 overflow-y-auto flex flex-col gap-2 custom-scrollbar">
                {tasks.map(t => (
                  <div key={t.id} className="flex items-center gap-2 cursor-pointer" onClick={() => toggleTask(t.id)}>
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${t.done ? 'bg-ochre border-ochre text-white' : (isDarkMode ? 'border-white/30' : 'border-black/30')}`}>
                      {t.done && <div className="w-2 h-2 bg-white rounded-sm"/>}
                    </div>
                    <span className={`text-sm ${t.done ? 'line-through opacity-50' : ''}`}>{t.text}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={addTask} className="flex gap-2">
                <input value={newTask} onChange={e=>setNewTask(e.target.value)} type="text" placeholder="Add task..." className={`flex-1 p-2 rounded-lg text-sm outline-none ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`} />
              </form>
            </div>
          )}

          {activeWidget === 'music' && (
            <div className="flex flex-col items-center justify-center h-32 gap-3 text-center">
              <Music className="w-8 h-8 text-ochre opacity-80 mb-1" />
              <p className="text-sm opacity-70">Connect Spotify or Apple Music to listen to focus playlists.</p>
              <button className="bg-ochre text-white px-4 py-1.5 rounded-full text-xs font-bold">Connect Provider</button>
            </div>
          )}

          {activeWidget === 'settings' && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm">
                <span>Auto-start Breaks</span>
                <div className="w-10 h-5 bg-ochre rounded-full p-0.5"><div className="w-4 h-4 bg-white rounded-full translate-x-5"/></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Tick Sound</span>
                <div className={`w-10 h-5 rounded-full p-0.5 ${isDarkMode ? 'bg-white/20' : 'bg-black/20'}`}><div className="w-4 h-4 bg-white rounded-full"/></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Floating Toolbar */}
      <div className="absolute bottom-8 left-0 w-full px-8 flex justify-between items-end">
        
        {/* Left Tools */}
        <div className="flex gap-2">
          {[
            { id: 'tasks', Icon: ClipboardList },
            { id: 'music', Icon: Music },
            { id: 'notes', Icon: PenTool }
          ].map(({id, Icon}) => (
            <button 
              key={id} 
              onClick={() => toggleWidget(id)} 
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border backdrop-blur-md ${activeWidget === id ? 'bg-ochre text-white border-ochre' : boxClasses}`}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>

        {/* Right Tools */}
        <div className={`flex gap-2 p-2 rounded-2xl backdrop-blur-md border shadow-xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-ochre/10 text-ochre rounded-xl font-bold text-sm mr-2 border border-ochre/20">
            <Flame size={14} className="fill-current" /> 14
          </div>
          
          <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${boxClasses}`} title="Nature Sounds">
            <Leaf size={18} />
          </button>
          
          <button onClick={handleFinish} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${boxClasses}`} title="Back to Dashboard">
            <Home size={18} />
          </button>
          
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${boxClasses}`} title="Toggle Light/Dark Theme">
            <Lightbulb size={18} />
          </button>
          
          <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${boxClasses}`} title="Rewards">
            <Gift size={18} />
          </button>
          
          <button onClick={() => toggleWidget('settings')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeWidget === 'settings' ? 'bg-ochre text-white' : boxClasses}`} title="Settings">
            <Settings size={18} />
          </button>
          
          <div className={`w-px h-6 self-center mx-1 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
          
          <button onClick={toggleFullscreen} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${boxClasses}`}>
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>

      </div>
    </div>
  );
}
