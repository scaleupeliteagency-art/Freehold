"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Play, Pause, Maximize, Minimize, Square, ClipboardList, Music, PenTool, Flame, Leaf, Home, Lightbulb, Gift, Settings, X, Upload, BellOff, Trash2, PlayCircle, Target, CheckSquare, Eye } from "lucide-react";
import { saveSong, getSongs, deleteSong } from "@/lib/audioStore";

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseOffset, setPauseOffset] = useState(0); 
  const [lastPauseTime, setLastPauseTime] = useState(null);
  
  // Protocol State
  const [sessionGoal, setSessionGoal] = useState("");
  const [isGoalSet, setIsGoalSet] = useState(false);
  const [showBreakScreen, setShowBreakScreen] = useState(false);
  
  const [activeWidget, setActiveWidget] = useState(null);
  const [notes, setNotes] = useState("");
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [isAlarming, setIsAlarming] = useState(false);
  
  // Library State
  const [savedSongs, setSavedSongs] = useState([]);
  const [currentPlayingSong, setCurrentPlayingSong] = useState(null);
  
  // Spotify State
  const [spotifyLink, setSpotifyLink] = useState("");
  const [spotifyEmbedUrl, setSpotifyEmbedUrl] = useState("");

  const audioCtxRef = useRef(null);
  const alarmIntervalRef = useRef(null);
  const localAudioRef = useRef(null);
  const eyeResetAudioRef = useRef(null);

  useEffect(() => {
    getSongs().then(setSavedSongs).catch(console.error);
    const savedSpotify = localStorage.getItem("working_ledger_spotify_url");
    if (savedSpotify) setSpotifyEmbedUrl(savedSpotify);
    
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const quoteInterval = setInterval(() => {
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }, 60000);
    return () => clearInterval(quoteInterval);
  }, []);

  useEffect(() => {
    let interval = null;
    if (activeTimer && !isPaused && !isAlarming && !showBreakScreen) {
      interval = setInterval(() => {
        const totalElapsed = Math.floor((new Date() - activeTimer.startTime) / 1000);
        setElapsed(totalElapsed - pauseOffset);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer, isPaused, pauseOffset, isAlarming, showBreakScreen]);

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

  const handleMinimize = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
    setIsMinimized(true);
  };

  const playBeep = (freq = 880, duration = 0.5) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error(e);
    }
  };

  // HARD CAP ALARM (90 minutes = 5400s)
  useEffect(() => {
    if (elapsed >= 5400 && !isAlarming && !showBreakScreen) {
      setIsAlarming(true);
      if (isMinimized) setIsMinimized(false); // Pop back up on alarm
      playBeep();
      alarmIntervalRef.current = setInterval(() => playBeep(), 1000);
    }
    return () => {
      if (alarmIntervalRef.current && !isAlarming) clearInterval(alarmIntervalRef.current);
    };
  }, [elapsed, isAlarming, showBreakScreen, isMinimized]);

  const stopAlarm = () => {
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    setIsAlarming(false);
  };

  const handleStopRequest = () => {
    stopAlarm();
    if (!isPaused) {
      setIsPaused(true);
      setLastPauseTime(new Date());
    }
    setIsMinimized(false);
    setShowBreakScreen(true);
  };

  const handleFinishCompletely = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    if (currentPlayingSong?.url) {
      URL.revokeObjectURL(currentPlayingSong.url);
    }
    onStop();
  };
  
  const handleResumeWorking = () => {
    setShowBreakScreen(false);
    handlePauseToggle(); // unpause
  };

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  let timeString = h > 0 
    ? `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  // Protocol Logic
  const minutes = Math.floor(elapsed / 60);
  let phaseText = "Deep Work Phase. Stay focused.";
  let timerColor = isDarkMode ? "text-white" : "text-ink";
  let isPulsing = false;
  
  const isEyeReset = minutes > 0 && minutes % 20 === 0 && (elapsed % 1200) < 20;

  if (elapsed >= 5400) {
    phaseText = "Hard cap reached (90m). Stop even if you're in flow.";
    timerColor = "text-red-500";
    isPulsing = true;
  } else if (minutes >= 45) {
    phaseText = "Aiming for 45–60m. Break at the next natural stopping point.";
    timerColor = "text-yellow-500";
  } else if (isEyeReset) {
    phaseText = "👀 Eye reset: Look 20ft away for 20 seconds.";
    timerColor = "text-blue-400";
    isPulsing = true;
  }

  const handleSetGoal = (e) => {
    e.preventDefault();
    if (sessionGoal.trim()) {
      setIsGoalSet(true);
      if (tasks.length === 0) {
        setTasks([{ id: Date.now(), text: sessionGoal, done: false }]);
      }
    }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const newSong = await saveSong(file);
      setSavedSongs([...savedSongs, newSong]);
      playSong(newSong);
    }
  };

  const playSong = (song) => {
    if (currentPlayingSong?.url) {
      URL.revokeObjectURL(currentPlayingSong.url);
    }
    const url = URL.createObjectURL(song.data);
    setCurrentPlayingSong({ ...song, url });
  };

  const removeSong = async (id) => {
    await deleteSong(id);
    setSavedSongs(savedSongs.filter(s => s.id !== id));
    if (currentPlayingSong?.id === id) {
      setCurrentPlayingSong(null);
    }
  };

  const handleConnectSpotify = () => {
    if (!spotifyLink) return;
    try {
      const url = new URL(spotifyLink);
      if (url.hostname === 'open.spotify.com') {
        const parts = url.pathname.split('/');
        if (parts.length >= 3) {
          const type = parts[1];
          const id = parts[2].split('?')[0];
          const embedUrl = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
          setSpotifyEmbedUrl(embedUrl);
          localStorage.setItem("working_ledger_spotify_url", embedUrl);
          setSpotifyLink("");
        } else {
          alert("Invalid Spotify link format.");
        }
      } else {
         alert("Please enter a valid open.spotify.com link.");
      }
    } catch (e) {
      alert("Invalid URL");
    }
  };

  const removeSpotify = () => {
    setSpotifyEmbedUrl("");
    localStorage.removeItem("working_ledger_spotify_url");
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

  const themeClasses = isDarkMode ? "bg-ink text-white selection:bg-ochre/30" : "bg-paper text-ink selection:bg-ochre/20";
  const boxClasses = isDarkMode ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/15 hover:text-white" : "bg-black/5 border-black/10 text-ink-muted hover:bg-black/10 hover:text-ink";

  if (isMinimized) {
    return (
      <div className={`fixed top-4 right-8 z-[200] w-72 p-3 rounded-2xl shadow-2xl border flex flex-col gap-2 ${isDarkMode ? 'bg-ink border-white/10 text-white' : 'bg-white border-black/10 text-ink'}`}>
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider truncate flex-1 mr-2">{inputName}</span>
          {isPaused && <span className="text-[10px] text-ochre font-bold uppercase animate-pulse">Paused</span>}
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-2xl font-bold tabular-nums tracking-tight px-1 ${isAlarming ? 'text-red-500 animate-pulse' : ''}`}>{timeString}</span>
          <div className="flex gap-1.5">
            <button onClick={handlePauseToggle} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}>
              {isPaused ? <Play className="w-3.5 h-3.5 text-ochre ml-0.5" fill="currentColor" /> : <Pause className="w-3.5 h-3.5 text-ochre" fill="currentColor" />}
            </button>
            <button onClick={handleStopRequest} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
              <Square className="w-3.5 h-3.5" fill="currentColor" />
            </button>
            <button onClick={() => setIsMinimized(false)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}>
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {/* Sticky Mini Protocol Status */}
        <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden mt-1">
          <div className={`h-full transition-all duration-1000 ${elapsed >= 5400 ? 'bg-red-500 w-full' : elapsed >= 2700 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: elapsed >= 5400 ? '100%' : `${Math.min(100, (elapsed / 2700) * 100)}%` }} />
        </div>
      </div>
    );
  }

  // BREAK SCREEN RENDER
  if (showBreakScreen) {
    const suggestedBreak = Math.max(1, Math.floor(minutes / 5));
    return (
      <div className={`fixed inset-0 z-[200] flex flex-col items-center justify-center font-sans ${themeClasses}`}>
        <div className={`p-10 md:p-16 rounded-3xl max-w-2xl text-center shadow-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'}`}>
          <h2 className="text-4xl font-bold mb-4">Session Complete</h2>
          <div className="flex justify-center gap-8 my-8">
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-widest opacity-60 font-bold mb-2">Deep Work Logged</span>
              <span className="text-5xl font-bold text-ochre">{minutes}<span className="text-2xl">m</span></span>
            </div>
            <div className="w-px bg-current opacity-10"></div>
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-widest opacity-60 font-bold mb-2">Suggested Break</span>
              <span className="text-5xl font-bold text-green-500">{suggestedBreak}<span className="text-2xl">m</span></span>
            </div>
          </div>
          <div className={`p-4 rounded-xl mb-10 inline-block text-left ${isDarkMode ? 'bg-black/20' : 'bg-black/5'}`}>
            <p className="text-sm font-semibold mb-2 flex items-center gap-2"><CheckSquare size={16} className="text-ochre"/> Goal: {sessionGoal || "Unspecified"}</p>
            <p className="text-sm opacity-80 flex items-center gap-2"><Leaf size={16} className="text-green-500"/> Protocol: Break is ~1/5 of work block. Move, don't scroll.</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={handleResumeWorking} className={`px-6 py-3 rounded-full font-bold transition-all border ${boxClasses}`}>
              Resume Session
            </button>
            <button onClick={handleFinishCompletely} className="px-8 py-3 rounded-full bg-ochre text-white font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">
              Log Time & Start Break
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col font-sans transition-colors duration-500 ${themeClasses}`}>
      
      {/* Top Header */}
      <div className="flex justify-between items-start p-8 md:p-12 w-full absolute top-0 left-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center">
            <Image src="/assets/logo1.png" alt="Working Ledger" width={150} height={40} className="object-contain" />
          </div>
          <span className="text-[10px] text-ochre tracking-widest uppercase font-bold mt-1 px-3 py-1 rounded-full border border-ochre/20 bg-ochre/10">Deep Work Protocol</span>
        </div>
        <div className="max-w-xs text-right hidden sm:block">
          <p className={`text-lg font-medium italic ${isDarkMode ? 'text-white/80' : 'text-ink-muted'}`}>"{quote}"</p>
        </div>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-6 mt-12">
        
        <h2 className={`text-xl md:text-2xl font-bold mb-4 text-center tracking-tight opacity-50`}>
          {inputName}
        </h2>

        {/* Goal Input */}
        {!isGoalSet ? (
          <form onSubmit={handleSetGoal} className="w-full max-w-lg mb-8 relative group">
            <Target className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 ${isDarkMode ? 'text-white/30' : 'text-ink/30'}`} />
            <input 
              autoFocus
              value={sessionGoal}
              onChange={e => setSessionGoal(e.target.value)}
              placeholder="Write one line on what you'll finish..."
              className={`w-full text-center text-lg md:text-xl p-4 pl-12 pr-12 rounded-2xl outline-none border-2 border-dashed border-ochre/50 bg-transparent transition-all focus:bg-ochre/5 focus:border-ochre ${isDarkMode ? 'text-white' : 'text-ink'}`}
            />
            <button type="submit" className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold px-3 py-1.5 rounded-lg bg-ochre text-white opacity-0 group-hover:opacity-100 transition-opacity ${sessionGoal ? 'opacity-100' : ''}`}>Set</button>
          </form>
        ) : (
          <div className={`mb-8 flex items-center gap-3 cursor-pointer p-4 rounded-2xl border transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'}`} onClick={() => setIsGoalSet(false)}>
            <div className={`w-5 h-5 rounded-md border-2 border-ochre flex items-center justify-center`} />
            <span className={`text-lg md:text-xl font-medium ${isDarkMode ? 'text-white' : 'text-ink'}`}>{sessionGoal}</span>
          </div>
        )}

        {/* Protocol Message */}
        <div className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-colors ${isPulsing ? 'animate-pulse' : ''} ${timerColor} ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}>
          {isEyeReset && <Eye className="w-4 h-4" />}
          {phaseText}
        </div>

        {/* Huge Timer */}
        <div className={`text-[25vw] md:text-[15rem] font-bold tracking-tighter leading-none tabular-nums drop-shadow-2xl transition-colors duration-1000 ${isAlarming ? 'animate-pulse' : ''} ${timerColor}`}>
          {timeString}
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-4 mt-12 h-20">
          {isAlarming ? (
            <button 
              onClick={handleStopRequest}
              className="px-10 py-4 rounded-full text-lg font-bold flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl bg-red-500 text-white animate-bounce"
            >
              <BellOff className="w-6 h-6" /> Stop & Take Break
            </button>
          ) : (
            <>
              <button 
                onClick={handlePauseToggle}
                className={`px-10 py-4 rounded-full text-lg font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl ${isDarkMode ? 'bg-white text-ink' : 'bg-ink text-white'}`}
              >
                {isPaused ? <Play className="w-5 h-5 fill-current text-ochre" /> : <Pause className="w-5 h-5 fill-current text-ochre" />}
                {isPaused ? "Resume" : "Pause"}
              </button>

              <button 
                onClick={handleStopRequest}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/20 hover:bg-red-500/30' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                title="Finish Session & Calculate Break"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Widgets Overlay */}
      {activeWidget && (
        <div className={`absolute bottom-28 left-8 w-[340px] p-5 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-bottom-5 ${isDarkMode ? 'bg-ink/90 border-white/10' : 'bg-white/90 border-black/10'}`}>
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
                <input value={newTask} onChange={e=>setNewTask(e.target.value)} type="text" placeholder="Add sub-task..." className={`flex-1 p-2 rounded-lg text-sm outline-none ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`} />
              </form>
            </div>
          )}

          {activeWidget === 'music' && (
            <div className="flex flex-col gap-4">
              
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                <div className="flex items-center justify-center gap-2 mb-3 text-green-500 font-bold">
                  <Music size={18} /> Spotify Player
                </div>
                {spotifyEmbedUrl ? (
                  <div className="flex flex-col gap-2">
                    <iframe 
                      src={spotifyEmbedUrl} 
                      width="100%" 
                      height="152" 
                      frameBorder="0" 
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                      loading="lazy"
                      className="rounded-xl"
                    ></iframe>
                    <button onClick={removeSpotify} className="text-xs text-red-400 font-semibold hover:underline text-center mt-1">Remove Player</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs opacity-70 text-center">Paste a Spotify Playlist, Album, or Track link to embed the player.</p>
                    <input 
                      type="text" 
                      value={spotifyLink}
                      onChange={e => setSpotifyLink(e.target.value)}
                      placeholder="https://open.spotify.com/playlist/..."
                      className={`w-full p-2 rounded-lg text-xs outline-none ${isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-ink border border-black/10 shadow-inner'}`}
                    />
                    <button 
                      onClick={handleConnectSpotify}
                      className="bg-green-500 text-white w-full py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors"
                    >
                      Load Player
                    </button>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}></div></div>
                <div className="relative flex justify-center text-xs"><span className={`px-2 ${isDarkMode ? 'bg-ink text-white/50' : 'bg-white text-ink-muted'}`}>OR UPLOAD LOCAL AUDIO</span></div>
              </div>

              <div className={`p-4 rounded-xl border flex flex-col gap-3 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                {/* Currently Playing */}
                {currentPlayingSong && (
                  <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-white/50 border-black/5'}`}>
                    <p className="text-[10px] uppercase font-bold text-ochre mb-1">Now Playing</p>
                    <p className="text-xs font-semibold truncate mb-2" title={currentPlayingSong.name}>{currentPlayingSong.name}</p>
                    <audio ref={localAudioRef} src={currentPlayingSong.url} controls className="w-full h-8 outline-none" loop autoPlay />
                  </div>
                )}
                
                {/* Library List */}
                {savedSongs.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                    {savedSongs.map(song => (
                      <div key={song.id} className={`flex items-center justify-between p-2 rounded-lg ${currentPlayingSong?.id === song.id ? (isDarkMode ? 'bg-white/10' : 'bg-black/10') : 'hover:bg-white/5'}`}>
                        <div className="flex items-center gap-2 overflow-hidden cursor-pointer flex-1" onClick={() => playSong(song)}>
                          <PlayCircle className="w-4 h-4 text-ochre shrink-0" />
                          <span className="text-xs truncate">{song.name}</span>
                        </div>
                        <button onClick={() => removeSong(song.id)} className="text-red-400 opacity-50 hover:opacity-100 p-1 shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <label className="flex flex-col items-center justify-center h-16 border-2 border-dashed border-ochre/30 rounded-lg cursor-pointer hover:bg-ochre/10 transition-colors mt-1">
                  <Upload className="w-5 h-5 mb-1 text-ochre" />
                  <span className="text-[10px] font-bold text-ochre uppercase tracking-wider">Add to Library</span>
                  <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {activeWidget === 'settings' && (
            <div className="flex flex-col gap-4">
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
          
          <button onClick={handleFinishCompletely} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${boxClasses}`} title="Back to Dashboard">
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

          <button onClick={handleMinimize} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${boxClasses}`} title="Minimize Timer to Header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6"></path><path d="M4 20l8-8"></path><path d="M20 10h-6V4"></path><path d="M20 4l-8 8"></path></svg>
          </button>
          
          <button onClick={toggleFullscreen} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${boxClasses}`} title="Toggle Browser Fullscreen">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>

      </div>
    </div>
  );
}
