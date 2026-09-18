"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, Settings2, CheckSquare, Target, ClipboardList, Lightbulb, History, CreditCard, UserRound, Search, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const renderTally = (count) => {
  if (!count || count <= 0) return null;
  return (
    <span className="flex gap-0.5 ml-auto pl-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-1 h-3 bg-ochre/40 rounded-full" />
      ))}
    </span>
  );
};

const TallyToggle = ({ onClick, collapsed }) => (
  <button 
    onClick={onClick}
    className="hover:bg-black/5 p-1.5 rounded-md transition-colors text-ink-muted hover:text-ink"
    title="Toggle sidebar"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="9" y1="3" x2="9" y2="21"></line>
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
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  
  const sidebarRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const savedWidth = localStorage.getItem("ledger_sidebar_width");
    const savedCollapsed = localStorage.getItem("ledger_sidebar_collapsed");
    if (savedWidth) setWidth(parseInt(savedWidth));
    if (savedCollapsed === "true") setIsCollapsed(true);
  }, []);

  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserEmail(user.email || "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", user.id)
        .single();
      const fallbackName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User";
      setUserName(profile?.name || fallbackName);
    };

    loadUserProfile();
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
    { label: "Dashboard", href: "/dashboard", shortcut: "d", icon: LayoutDashboard },
    { label: "System", href: "/system", shortcut: "s", icon: Settings2 },
    { label: "Inputs", href: "/inputs", shortcut: "i", tally: 3, icon: CheckSquare },
    { label: "Reviews", href: "/reviews", shortcut: "v", tally: 1, icon: ClipboardList },
    { label: "Insights", href: "/insights", shortcut: "k", icon: Lightbulb },
    { label: "Results", href: "/results", shortcut: "r", icon: Target },
    { label: "History", href: "/history", shortcut: "h", icon: History },
  ];

  const isReviewContext = pathname?.includes("/reviews");
  const isInsightsContext = pathname?.includes("/insights");

  if (!mounted) return <div className="min-h-screen bg-background text-ink" />;

  return (
    <div className="flex min-h-screen w-full bg-background text-ink font-sans">
      
      {/* SIDEBAR */}
      <div 
        ref={sidebarRef}
        className="hidden md:flex fixed inset-y-0 left-0 bg-sidebar z-40 flex-col transition-[width] duration-300 ease-in-out border-r border-divider/50 shadow-sm"
        style={{ width: isCollapsed ? 64 : width }}
      >
        <div 
          className="absolute top-0 right-[-2px] bottom-0 w-1 cursor-col-resize hover:bg-ochre/20 transition-colors z-50 flex items-center justify-center"
          onMouseDown={startResizing}
        >
        </div>

        <div className={`flex py-6 ${isCollapsed ? 'flex-col items-center px-2 gap-4' : 'items-center px-6 justify-between'}`}>
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-ochre/10 flex items-center justify-center group-hover:bg-ochre/20 transition-colors">
                <Image src="/assets/logo1.png" alt="Logo" width={16} height={16} className="opacity-90" />
              </div>
              <span className="font-semibold text-ink text-[15px] tracking-tight">Working Ledger</span>
            </Link>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-ochre/10 flex items-center justify-center">
              <Image src="/assets/logo1.png" alt="Logo" width={16} height={16} className="opacity-90" />
            </div>
          )}
          <div className="z-50 relative">
            <TallyToggle onClick={toggleCollapse} collapsed={isCollapsed} />
          </div>
        </div>

        {!isCollapsed && (
          <div className="px-4 mb-6">
            <button 
              onClick={() => setCmdOpen(true)}
              className="w-full flex items-center justify-between text-sm text-ink-muted bg-white/50 hover:bg-white border border-divider/50 hover:border-divider shadow-sm rounded-lg px-3 py-2 transition-all cursor-text group"
            >
              <div className="flex items-center gap-2">
                <Search size={14} className="text-ink-muted group-hover:text-ink transition-colors" />
                <span className="font-medium group-hover:text-ink transition-colors">Search...</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium bg-black/5 px-1.5 py-0.5 rounded text-ink-muted">
                <span>⌘</span><span>K</span>
              </div>
            </button>
          </div>
        )}

        <nav className={`flex-1 overflow-y-auto hide-scrollbar ${isCollapsed ? 'px-2' : 'px-4'} flex flex-col gap-1 text-[14px] font-medium`}>
          {mainNav.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <div key={item.href} className="relative group flex items-center">
                {!isCollapsed && (
                  <span className={`absolute -left-1 text-[10px] font-medium text-ochre/80 transition-opacity ${showShortcuts ? 'opacity-100' : 'opacity-0'}`}>
                    {item.shortcut}
                  </span>
                )}
                
                <Link 
                  href={item.href} 
                  className={`relative flex items-center w-full transition-all ${isCollapsed ? 'justify-center p-2 rounded-xl' : 'px-3 py-2 rounded-lg'} ${isActive ? 'bg-white shadow-sm border border-divider/40 text-ink' : 'text-ink-muted hover:bg-black/5 hover:text-ink border border-transparent'}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="flex items-center gap-3 w-full">
                    <item.icon size={isCollapsed ? 20 : 18} strokeWidth={isActive ? 2 : 1.5} className={isActive ? 'text-ochre' : ''} />
                    {!isCollapsed && (
                      <span className="truncate">
                        {item.label}
                      </span>
                    )}
                  </span>
                  
                  {!isCollapsed && renderTally(item.tally)}
                </Link>
              </div>
            );
          })}

          {!isCollapsed && isReviewContext && (
            <div className="mt-4 mb-2 mx-3 border-l-2 border-divider flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-[11px] font-semibold text-ink-muted ml-3 mb-1">Active Context</span>
              <Link href="/reviews" className="text-[13px] font-medium text-ink bg-white shadow-sm border border-divider/40 rounded-md px-3 py-1.5 ml-1.5">Current Draft</Link>
              <Link href="/history" className="text-[13px] text-ink-muted hover:bg-black/5 hover:text-ink rounded-md px-3 py-1.5 ml-1.5 flex justify-between items-center">
                Past Records {renderTally(4)}
              </Link>
            </div>
          )}

          {!isCollapsed && isInsightsContext && (
            <div className="mt-4 mb-2 mx-3 border-l-2 border-divider flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-[11px] font-semibold text-ink-muted ml-3 mb-1">Active Context</span>
              <Link href="/insights" className="text-[13px] font-medium text-ink bg-white shadow-sm border border-divider/40 rounded-md px-3 py-1.5 ml-1.5 flex justify-between items-center">
                All Insights {renderTally(4)}
              </Link>
              <Link href="/insights?filter=validated" className="text-[13px] text-ink-muted hover:bg-black/5 hover:text-ink rounded-md px-3 py-1.5 ml-1.5 flex justify-between items-center">
                Validated {renderTally(1)}
              </Link>
              <Link href="/insights?filter=hypotheses" className="text-[13px] text-ink-muted hover:bg-black/5 hover:text-ink rounded-md px-3 py-1.5 ml-1.5 flex justify-between items-center">
                Hypotheses {renderTally(1)}
              </Link>
            </div>
          )}

        </nav>

        {/* Footer Status & Profile */}
        <div className={`mt-auto border-t border-divider/50 pt-3 pb-4 ${isCollapsed ? 'px-2 flex flex-col items-center gap-3' : 'px-4 flex flex-col gap-3'}`}>
          {!isCollapsed && (
            <div className="flex items-center justify-between px-3">
              <div className="text-[11px] font-medium text-ink-muted flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-moss/80 relative">
                  <div className="absolute inset-0 rounded-full bg-moss animate-ping opacity-50"></div>
                </div>
                Synced
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-1.5 h-1.5 rounded-full bg-moss/80 relative" title="System synced">
              <div className="absolute inset-0 rounded-full bg-moss animate-ping opacity-50"></div>
            </div>
          )}

          {!isCollapsed && (
            <Link href="/profile" className="flex items-center justify-between w-full p-2 rounded-xl border border-transparent hover:border-divider/50 hover:bg-white/60 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-ochre/20 to-ochre/10 border border-ochre/20 text-ochre flex items-center justify-center text-sm font-semibold shadow-sm shrink-0">
                  {(userName || userEmail || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-[13px] font-semibold text-ink truncate leading-tight">{userName || "Loading..."}</span>
                  <span className="text-[11px] text-ink-muted truncate leading-tight">{userEmail || "user@example.com"}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-ink-muted group-hover:text-ink transition-colors shrink-0" />
            </Link>
          )}
          
          {isCollapsed && (
            <Link
              href="/profile"
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-ochre/20 to-ochre/10 border border-ochre/20 text-ochre flex items-center justify-center text-sm font-semibold shadow-sm hover:shadow transition-all shrink-0"
              title={`${userName || "User"} profile`}
            >
              {(userName || userEmail || "U").charAt(0).toUpperCase()}
            </Link>
          )}

          {isCollapsed && (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              className="text-[10px] font-medium text-ink-muted hover:text-ochre transition-colors p-2"
              title="Log out"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          )}

          {!isCollapsed && (
            <div className="px-3">
              <button 
                onClick={async () => {
                  const { supabase } = await import('@/lib/supabase/client');
                  await supabase.auth.signOut();
                  window.location.href = '/login';
                }}
                className="w-full text-left text-[12px] font-medium text-ink-muted hover:text-ink transition-colors flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div 
        className="flex flex-col flex-1 w-full transition-[padding] duration-300 ease-in-out pl-0 md:pl-[var(--sidebar-width)]"
        style={{ "--sidebar-width": `${isCollapsed ? 64 : width}px` }}
      >
        <div className="lg:hidden border-b border-divider/50 p-4 flex justify-between items-center bg-background sticky top-0 z-50">
          <h2 className="font-semibold text-lg tracking-tight">Working Ledger</h2>
          <button className="p-2 rounded-lg bg-white border border-divider shadow-sm text-sm font-medium">Menu</button>
        </div>
        
        <main className="flex-1 w-full p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAV (ULTRA ADVANCED FLOATING DOCK) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-max bg-white/75 backdrop-blur-3xl border border-white/60 shadow-[0_8px_32px_rgba(15,23,42,0.12),_0_0_0_1px_rgba(255,255,255,0.6)_inset] rounded-full z-50 md:hidden flex justify-center items-center p-1.5 gap-1.5">
        {mainNav.filter(n => n.label !== "System").map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(`${item.href}/`));
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`relative flex items-center justify-center rounded-full transition-all duration-300 overflow-hidden ${isActive ? 'bg-gradient-to-br from-orange-500 to-orange-400 shadow-[0_2px_10px_rgba(234,88,12,0.3)] px-4 py-2.5' : 'px-3 py-2.5 hover:bg-black/5'}`}
            >
              <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {isActive && (
                <span className="relative z-10 ml-2 text-xs font-semibold text-white tracking-wide animate-in fade-in slide-in-from-left-2 duration-300">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* COMMAND PALETTE */}
      {cmdOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
          <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={() => setCmdOpen(false)} />
          <div className="relative w-full max-w-xl bg-paper border border-divider shadow-2xl rounded-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center px-4 border-b border-divider/50 bg-white">
              <Search size={18} className="text-ochre mr-3" />
              <input 
                type="text" 
                autoFocus
                placeholder="Search anything..." 
                className="w-full bg-transparent py-4 text-ink text-base font-medium focus:outline-none placeholder:text-ink-muted"
              />
            </div>
            <div className="p-2 max-h-[40vh] overflow-y-auto bg-background/50">
              <div className="px-3 py-2 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Navigation</div>
              {mainNav.map(n => (
                <Link 
                  key={n.href}
                  href={n.href} 
                  onClick={() => setCmdOpen(false)}
                  className="flex items-center px-3 py-2.5 text-sm text-ink hover:bg-white hover:shadow-sm rounded-xl transition-all group border border-transparent hover:border-divider/50 mx-1"
                >
                  <n.icon size={16} className="mr-3 text-ink-muted group-hover:text-ochre transition-colors" />
                  <span className="flex-1 font-medium">{n.label}</span>
                  <span className="text-[11px] font-medium text-ink-muted bg-white border border-divider/50 px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {n.shortcut}
                  </span>
                </Link>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-divider/50 bg-sidebar/50 text-[11px] text-ink-muted flex justify-between font-medium">
              <span className="flex items-center gap-1">Press <kbd className="bg-white border border-divider/50 px-1 rounded shadow-sm">ESC</kbd> to close</span>
              <span className="flex items-center gap-1">Press <kbd className="bg-white border border-divider/50 px-1 rounded shadow-sm">↵</kbd> to select</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
