import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, X, Brain, LayoutDashboard, Menu, Sparkles, FolderLock } from 'lucide-react';
import { saveDecision, subscribeToDecisions, deleteDecision, updateDecisionWeights, isMockMode } from './supabaseClient';
import { User } from '@supabase/supabase-js';
import { Decision, AnalysisType } from './types';
import { cn } from './lib/utils';

import { AnalysisForm } from './components/AnalysisForm';
import { DecisionResult } from './components/DecisionViews';

export default function App() {
  const [user] = useState<User>({ id: 'local-default-user', email: 'guest@example.com' } as any);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribeDb = subscribeToDecisions(user.id, setDecisions);
    return () => {
      if (unsubscribeDb) unsubscribeDb();
    };
  }, [user.id]);

  const selectedDecision = decisions.find(d => d.id === selectedId);

  const handleAnalyze = async (decision: string, type: AnalysisType) => {
    if (!user) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ decision, type }),
      });
      
      const analysisData = await response.json();
      
      if (!response.ok) {
        throw new Error(analysisData.error || "Analysis failed");
      }
      
      const id = await saveDecision({
        userId: user.id,
        title: decision,
        analysisType: type,
        analysisData,
        weights: {},
      });
      
      setSelectedId(id || null);
      setActiveTab('history');
      setIsSidebarOpen(false); // Close sidebar on mobile after creation
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#08090E] font-sans text-slate-100 overflow-hidden relative">
      {/* Glow Backdrops */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] rounded-full glow-spot-violet opacity-65 pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full glow-spot-blue opacity-40 pointer-events-none z-0" />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "absolute md:relative z-50 h-full w-80 glass-panel border-r border-[#1E2030]/60 flex flex-col transition-transform duration-300 z-50",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 border-b border-[#1E2030]/60">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-violet-600/20 shrink-0">
                T
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-black tracking-tight leading-none text-white">The Tiebreaker</h1>
                {isMockMode && (
                  <span className="inline-block self-start mt-1.5 text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-extrabold tracking-wider uppercase">
                    Demo Mode
                  </span>
                )}
              </div>
            </div>
            <button 
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-900/60 rounded-xl transition-all"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => { setSelectedId(null); setActiveTab('new'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 border cursor-pointer",
              activeTab === 'new' 
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-transparent shadow-lg shadow-violet-600/15 hover:scale-[1.01]" 
                : "bg-slate-900/40 text-slate-300 border-[#1E2030] hover:bg-slate-900/80 hover:text-white"
            )}
          >
            <Plus className="w-4 h-4" />
            <span>New Decision</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-2 mb-2">Saved Decisions</div>
          {decisions.length === 0 ? (
            <div className="text-xs text-slate-400 p-6 border border-dashed border-[#1E2030] rounded-2xl text-center bg-slate-950/20">
              <FolderLock className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
              <p className="leading-relaxed font-medium">No saved decisions yet.<br />Start a new analysis!</p>
            </div>
          ) : (
            decisions.map((d) => (
              <button
                key={d.id}
                onClick={() => { setSelectedId(d.id!); setActiveTab('history'); setIsSidebarOpen(false); }}
                className={cn(
                  "w-full text-left p-3.5 rounded-xl transition-all duration-200 group relative border flex flex-col gap-1 cursor-pointer",
                  selectedId === d.id 
                    ? "bg-[#151724]/90 border-violet-500/30 shadow-md shadow-violet-600/5" 
                    : "border-transparent hover:bg-slate-900/40 hover:border-[#1E2030]"
                )}
              >
                {selectedId === d.id && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-r-full" />
                )}
                <div className={cn("text-xs font-semibold truncate pr-8 leading-tight", selectedId === d.id ? "text-white" : "text-slate-300 group-hover:text-white")}>
                  {d.title}
                </div>
                <div className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-wider font-mono">
                  {new Date(d.createdAt).toLocaleDateString()}
                </div>
                <button 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-slate-800/80 p-1.5 rounded-lg transition-all"
                  onClick={(e) => { e.stopPropagation(); deleteDecision(d.id!); if(selectedId === d.id) setSelectedId(null); }}
                  aria-label="Delete decision"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                </button>
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-[#1E2030]/60">
          <div className="flex items-center gap-3 bg-slate-950/45 p-3 rounded-2xl border border-slate-900/60 shadow-inner">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/50 text-slate-300 flex items-center justify-center text-xs font-black shrink-0 relative">
              L
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-slate-950">
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
              </span>
            </div>
            <div className="flex flex-col">
              <div className="text-xs font-black text-white leading-none">Local Workspace</div>
              <span className="text-[9px] text-slate-500 mt-1 font-bold tracking-tight uppercase">Offline Database</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-transparent flex flex-col relative w-full z-10">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-[#1E2030]/40 sticky top-0 bg-[#08090E]/80 backdrop-blur-md z-30">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-white"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="font-black tracking-tight ml-2 text-white font-heading">The Tiebreaker</div>
          </div>
          {isMockMode && (
            <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full px-2 py-0.5 font-extrabold tracking-wider uppercase">
              Demo Mode
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'new' ? (
            <motion.div 
              key="new"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="max-w-3xl mx-auto h-full flex flex-col justify-center px-4 md:px-8 py-12 md:py-0 w-full"
            >
              <div className="mb-10 text-center md:text-left flex flex-col items-center md:items-start">
                <div className="w-14 h-14 bg-gradient-to-tr from-violet-600/10 to-indigo-600/10 border border-violet-500/20 text-violet-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-600/5 neon-glow-violet shrink-0">
                  <Brain className="w-7 h-7" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-gradient-primary leading-tight mb-4 flex items-center gap-2">
                  What's on your mind?
                </h2>
                <p className="text-sm md:text-base text-slate-400 font-medium">Break down complex life decisions with dynamic AI-powered clarity.</p>
              </div>
              <AnalysisForm onAnalyze={handleAnalyze} isLoading={isAnalyzing} error={error} />
            </motion.div>
          ) : (
            <motion.div 
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="h-full flex flex-col bg-transparent"
            >
              {selectedDecision ? (
                <DecisionResult 
                  decision={selectedDecision} 
                  onUpdateWeights={(weights) => updateDecisionWeights(selectedDecision.id!, weights)}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                  <div className="w-16 h-16 bg-slate-900/35 rounded-2xl border border-slate-900 flex items-center justify-center text-slate-600 mb-4 opacity-75">
                    <LayoutDashboard className="w-8 h-8" />
                  </div>
                  <p className="text-slate-400 font-bold text-sm tracking-tight">Select an analysis from the sidebar or start a new one</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
