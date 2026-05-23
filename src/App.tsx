import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, X, Brain, LayoutDashboard, Menu } from 'lucide-react';
import { loginWithEmail, logout, saveDecision, subscribeToDecisions, deleteDecision, updateDecisionWeights, supabase, isMockMode } from './supabaseClient';
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
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
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
    <div className="flex h-screen bg-[#F3F4F6] font-sans text-slate-900 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "absolute md:relative z-50 h-full w-80 border-r border-slate-200 bg-white flex flex-col transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white font-bold shrink-0">T</div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold tracking-tight leading-none text-slate-900">The Tiebreaker</h1>
                {isMockMode && (
                  <span className="inline-block self-start mt-1 text-[9px] bg-amber-50 text-amber-600 border border-amber-200/50 rounded-full px-1.5 py-0.5 font-medium tracking-wide uppercase">
                    Demo Mode
                  </span>
                )}
              </div>
            </div>
            <button 
              className="md:hidden p-2 text-slate-400 hover:text-slate-900 rounded-lg"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => { setSelectedId(null); setActiveTab('new'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all border",
              activeTab === 'new' ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            )}
          >
            <Plus className="w-4 h-4" />
            <span>New Decision</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">Saved Decisions</div>
          {decisions.length === 0 ? (
            <div className="text-xs text-slate-400 p-4 border border-dashed border-slate-200 rounded-lg text-center bg-slate-50/50">
              No saved decisions yet. Start a new analysis to see it here!
            </div>
          ) : (
            decisions.map((d) => (
              <button
                key={d.id}
                onClick={() => { setSelectedId(d.id!); setActiveTab('history'); setIsSidebarOpen(false); }}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all group relative border",
                  selectedId === d.id ? "bg-slate-50 border-slate-100 shadow-sm" : "border-transparent hover:bg-slate-50"
                )}
              >
                <div className={cn("text-sm font-medium truncate pr-6", selectedId === d.id ? "text-slate-900" : "text-slate-600")}>{d.title}</div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight">
                  {new Date(d.createdAt).toLocaleDateString()}
                </div>
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); deleteDecision(d.id!); if(selectedId === d.id) setSelectedId(null); }}
                  aria-label="Delete decision"
                >
                  <Trash2 className="w-4 h-4 text-slate-900" />
                </button>
              </button>
            ))
          )}
        </div>

        <div className="p-6 border-t border-[#141414]/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
              L
            </div>
            <div className="flex flex-col">
              <div className="text-xs font-bold text-slate-800 leading-none">Local Workspace</div>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">Offline Database Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white flex flex-col relative w-full">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-30">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="font-bold tracking-tight ml-2">The Tiebreaker</div>
          </div>
          {isMockMode && (
            <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200/50 rounded-full px-1.5 py-0.5 font-medium tracking-wide uppercase">
              Demo Mode
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'new' ? (
            <motion.div 
              key="new"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto h-full flex flex-col justify-center px-4 md:px-8 py-12 md:py-0 w-full"
            >
              <div className="mb-12">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white mb-6">
                  <Brain className="w-6 h-6" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">What's on your mind?</h2>
                <p className="text-lg text-slate-500">Break down complex decisions with AI-powered clarity.</p>
              </div>
              <AnalysisForm onAnalyze={handleAnalyze} isLoading={isAnalyzing} error={error} />
            </motion.div>
          ) : (
            <motion.div 
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col"
            >
              {selectedDecision ? (
                <DecisionResult 
                  decision={selectedDecision} 
                  onUpdateWeights={(weights) => updateDecisionWeights(selectedDecision.id!, weights)}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                  <LayoutDashboard className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-slate-400 font-medium">Select an analysis or start a new one</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
