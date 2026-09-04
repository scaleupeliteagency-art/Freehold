"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const renderTally = (count) => {
  if (!count || count <= 0) return null;
  return <span className="font-serif text-[10px] tracking-[-0.15em] text-ink/40 ml-2">{'|'.repeat(count)}</span>;
};

const TallyToggle = ({ onClick, collapsed }) => (
  <button 
    onClick={onClick}
    className="hover:text-ochre transition-colors p-2 text-ink/70"
    title="Toggle margin"
  >
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
      <path d={collapsed ? "M8 4v8 M12 4v8" : "M4 4v8 M8 4v8 M12 4v8"} />
    </svg>
  </button>
);

export function LedgerSidebar({ children }) {
  const pathname = usePathname();
  const [width, setWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const sidebarRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const savedWidth = localStorage.getItem("ledger_sidebar_width");
    const savedCollapsed = localStorage.getItem("ledger_sidebar_collapsed");
    if (savedWidth) setWidth(parseInt(savedWidth));
    if (savedCollapsed === "true") setIsCollapsed(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Alt" || e.key === "Control" || e.metaKey) {
        setShowShortcuts(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
      if (e.key === "/" && !cmdOpen && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key === "Alt" || e.key === "Control" || e.key === "Meta") {
        setShowShortcuts(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [cmdOpen]);

  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => {
    setIsResizing(false);
    localStorage.setItem("ledger_sidebar_width", width.toString());
  }, [width]);
  
  const resize = useCallback((mouseMoveEvent) => {
    if (isResizing) {
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth > 200 && newWidth < 400) {
        setWidth(newWidth);
        setIsCollapsed(false);
        localStorage.setItem("ledger_sidebar_collapsed", "false");
      } else if (newWidth <= 200) {
        setIsCollapsed(true);
        localStorage.setItem("ledger_sidebar_collapsed", "true");
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("ledger_sidebar_collapsed", next.toString());
  };

  const mainNav = [
    { label: "Dashboard", href: "/dashboard", shortcut: "d" },
    { label: "System", href: "/system", shortcut: "s" },
    { label: "Daily Inputs", href: "/inputs", shortcut: "i", tally: 3 },
    { label: "Results", href: "/results", shortcut: "r" },
    { label: "Review", href: "/reviews", shortcut: "v", tally: 1 },
    { label: "Insights", href: "/insights", shortcut: "k" },
    { label: "History", href: "/history", shortcut: "h" },
  ];

  const isReviewContext = pathname?.includes("/reviews");
  const isInsightsContext = pathname?.includes("/insights");

  // Avoid hydration mismatch by not rendering layout specific stuff until mounted
  if (!mounted) return <div className="min-h-screen bg-paper text-ink" />;

  return (
    <div className="flex min-h-screen w-full bg-paper text-ink">
      
      {/* SIDEBAR */}
      <div 
        ref={sidebarRef}
        className="fixed inset-y-0 left-0 bg-paper z-40 flex flex-col transition-[width] duration-300 ease-in-out border-r border-divider"
        style={{ width: isCollapsed ? 56 : width }}
      >
        <div 
          className="absolute top-0 right-[-2px] bottom-0 w-1 cursor-col-resize hover:bg-ochre transition-colors z-50 flex items-center justify-center"
          onMouseDown={startResizing}
        >
        </div>

        <div className={`flex items-center pt-8 pb-8 ${isCollapsed ? 'px-3 justify-center' : 'px-8 justify-between'}`}>
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-3">
              <Image src="/assets/logo1.png" alt="Logo" width={20} height={20} className="grayscale contrast-125" />
              <span className="font-serif font-bold text-ink tracking-tight uppercase text-xs">Working Ledger</span>
            </Link>
          )}
          {isCollapsed && (
             <Image src="/assets/logo1.png" alt="Logo" width={20} height={20} className="grayscale contrast-125 mb-4" />
          )}
          <div className={isCollapsed ? 'absolute top-20' : ''}>
            <TallyToggle onClick={toggleCollapse} collapsed={isCollapsed} />
          </div>
        </div>

        {!isCollapsed && (
          <div className="px-8 mb-8">
            <button 
              onClick={() => setCmdOpen(true)}
              className="w-full flex justify-between items-center text-[10px] font-mono text-ink/40 uppercase tracking-widest hover:text-ink/70 transition-colors border-b border-divider/50 pb-2 cursor-text"
            >
              <span>Command</span>
              <span>⌘K</span>
            </button>
          </div>
        )}

        <nav className={`flex-1 overflow-y-auto hide-scrollbar ${isCollapsed ? 'px-0' : 'px-8'} flex flex-col gap-3 text-sm font-sans font-medium`}>
          {mainNav.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <div key={item.href} className="relative group flex items-center">
                {!isCollapsed && (
                  <span className={`absolute -left-5 text-[10px] font-mono font-bold text-moss transition-opacity ${showShortcuts ? 'opacity-100' : 'opacity-0'}`}>
                    {item.shortcut}
                  </span>
                )}
                
                <Link 
                  href={item.href} 
                  className={`relative flex items-center w-full ${isCollapsed ? 'justify-center py-2' : 'py-1'}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={`
                    transition-all 
                    ${isCollapsed ? 'text-xs uppercase tracking-widest writing-vertical rotate-180 py-4 opacity-50 hover:opacity-100' : ''} 
                    ${isActive ? 'text-ink' : 'text-ink/60 hover:text-ink'}
                  `}>
                    {!isCollapsed ? (
                      <span className={isActive ? "border-b border-ochre pb-0.5" : "border-b border-transparent pb-0.5"}>
                        {item.label}
                      </span>
                    ) : (
                      item.label.substring(0, 3)
                    )}
                  </span>
                  
                  {!isCollapsed && renderTally(item.tally)}
                </Link>
              </div>
            );
          })}

          {!isCollapsed && isReviewContext && (
            <div className="mt-4 pl-4 border-l border-divider/50 flex flex-col gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ochre mb-1">Active Context</span>
              <Link href="/reviews" className="text-sm text-ink border-b border-ochre pb-0.5 self-start">Current Draft</Link>
              <Link href="/history" className="text-sm text-ink/60 hover:text-ink pb-0.5 self-start">Past Records {renderTally(4)}</Link>
            </div>
          )}

          {!isCollapsed && isInsightsContext && (
            <div className="mt-4 pl-4 border-l border-divider/50 flex flex-col gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ochre mb-1">Active Context</span>
              <Link href="/insights" className="text-sm text-ink border-b border-ochre pb-0.5 self-start">All Insights {renderTally(4)}</Link>
              <Link href="/insights?filter=validated" className="text-sm text-ink/60 hover:text-ink pb-0.5 self-start">Validated {renderTally(1)}</Link>
              <Link href="/insights?filter=hypotheses" className="text-sm text-ink/60 hover:text-ink pb-0.5 self-start">Hypotheses {renderTally(1)}</Link>
            </div>
          )}

        </nav>

        {/* Footer Status & Profile */}
        <div className={`mt-auto border-t border-divider/50 pt-4 pb-6 ${isCollapsed ? 'px-2 flex flex-col items-center' : 'px-8 flex flex-col gap-4'}`}>
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full p-2 border border-divider hover:bg-white/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-ink text-paper flex items-center justify-center font-serif text-sm font-bold">
                  A
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-ink leading-none">Ayoub</span>
                  <span className="text-[10px] text-ink/50 font-mono mt-1">Founder</span>
                </div>
              </div>
              <button 
                onClick={async () => {
                  const { supabase } = await import('@/lib/supabase/client');
                  await supabase.auth.signOut();
                  window.location.href = '/login';
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-ink/40 hover:text-ochre transition-colors p-2"
                title="Log out"
              >
                OUT
              </button>
            </div>
          )}
          {isCollapsed && (
            <button 
              onClick={async () => {
                const { supabase } = await import('@/lib/supabase/client');
                await supabase.auth.signOut();
                window.location.href = '/login';
              }}
              className="w-8 h-8 bg-ink text-paper flex items-center justify-center font-serif text-sm font-bold mb-4 cursor-pointer hover:bg-ochre transition-colors" 
              title="Ayoub (Log out)"
            >
              A
            </button>
          )}

          {!isCollapsed ? (
            <div className="text-[10px] font-serif text-ink/70 mt-2">
              Last updated 2 min ago
            </div>
          ) : (
            <div className="w-2 h-2 rounded-full bg-moss mx-auto opacity-50" title="System synced" />
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div 
        className="flex flex-col flex-1 w-full transition-[padding] duration-300 ease-in-out"
        style={{ paddingLeft: isCollapsed ? 56 : width }}
      >
        <div className="lg:hidden border-b border-divider p-4 flex justify-between items-center bg-paper sticky top-0 z-50">
          <h2 className="font-serif font-bold text-lg tracking-tight">Working Ledger</h2>
          <span className="text-[10px] uppercase tracking-widest border border-divider px-2 py-1">Menu</span>
        </div>
        
        <main className="flex-1 w-full max-w-5xl mx-auto px-6 lg:px-16 py-12">
          {children}
        </main>
      </div>

      {/* COMMAND PALETTE */}
      {cmdOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          <div className="absolute inset-0 bg-paper/80 backdrop-blur-sm" onClick={() => setCmdOpen(false)} />
          <div className="relative w-full max-w-xl bg-paper border border-divider shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center px-4 border-b border-divider">
              <span className="text-ochre mr-3 font-mono">{'>'}</span>
              <input 
                type="text" 
                autoFocus
                placeholder="Jump to section, insight, or record..." 
                className="w-full bg-transparent py-4 text-ink font-serif text-lg focus:outline-none placeholder:text-ink/30"
              />
            </div>
            <div className="p-2 max-h-[40vh] overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-bold text-ink/40 uppercase tracking-widest mt-2 mb-1">Navigation</div>
              {mainNav.map(n => (
                <Link 
                  key={n.href}
                  href={n.href} 
                  onClick={() => setCmdOpen(false)}
                  className="block px-3 py-2 text-sm text-ink hover:bg-black/5 flex justify-between items-center group"
                >
                  <span>{n.label}</span>
                  <span className="text-[10px] font-mono text-ink/30 opacity-0 group-hover:opacity-100 transition-opacity border border-divider/50 px-1 rounded-sm">
                    {n.shortcut}
                  </span>
                </Link>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-divider/50 bg-black/5 text-[10px] text-ink/50 flex justify-between">
              <span>ESC to close</span>
              <span>↵ to select</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
