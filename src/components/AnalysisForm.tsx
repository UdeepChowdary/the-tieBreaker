import { useState } from 'react';
import { Scale, Table as TableIcon, Zap, X, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { AnalysisType } from '../types';

export function AnalysisForm({ onAnalyze, isLoading, error }: { onAnalyze: (d: string, t: AnalysisType) => void, isLoading: boolean, error: string | null }) {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<AnalysisType>("pros_cons");

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="relative group">
        <textarea
          value={prompt}
          onChange={(e) => {
            if (e.target.value.length <= 1000) {
              setPrompt(e.target.value);
            }
          }}
          placeholder="e.g., Should I buy a Rolex with a loan...?"
          className="w-full h-44 pb-12 p-5 text-base md:text-lg font-medium rounded-2xl glass-input placeholder:text-slate-500 text-white resize-none transition-all duration-300"
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          <span className={cn(
            "text-[10px] font-bold font-mono tracking-wider",
            prompt.length > 900 ? "text-amber-500" : "text-slate-500"
          )}>
            {prompt.length}/1000
          </span>
          {prompt && (
            <button 
              onClick={() => setPrompt("")}
              className="p-1.5 text-slate-400 hover:text-white transition-colors bg-slate-900/60 hover:bg-slate-800/80 rounded-xl"
              aria-label="Clear prompt"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { id: 'pros_cons', label: 'Pros & Cons', icon: Scale, desc: 'Weighted score calculation' },
          { id: 'swot', label: 'SWOT Analysis', icon: Zap, desc: 'Bento quadrant view' },
          { id: 'comparison', label: 'Comparison', icon: TableIcon, desc: 'Options grid view' },
        ].map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setType(opt.id as AnalysisType)}
            className={cn(
              "flex flex-col items-start gap-2 p-4 rounded-2xl border transition-all duration-300 cursor-pointer text-left",
              type === opt.id 
                ? "bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border-violet-500/40 text-white shadow-lg shadow-violet-500/5 ring-1 ring-violet-500/20" 
                : "border-[#1E2030] bg-[#12131C]/30 text-slate-400 hover:border-slate-700/60 hover:bg-[#12131C]/60 hover:text-slate-200"
            )}
          >
            <opt.icon className={cn("w-5 h-5 shrink-0 mb-1", type === opt.id ? "text-violet-400 animate-pulse" : "text-slate-500")} />
            <span className="text-[10px] font-extrabold uppercase tracking-widest leading-none">
              {opt.label}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 font-medium leading-normal">
              {opt.desc}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 text-rose-300 text-xs font-semibold border border-rose-500/20 leading-relaxed shadow-sm">
          {error}
        </div>
      )}

      <button
        disabled={!prompt || isLoading}
        onClick={() => onAnalyze(prompt, type)}
        className={cn(
          "w-full py-4 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg",
          !prompt || isLoading 
            ? "bg-slate-900/40 text-slate-600 border border-[#1E2030] cursor-not-allowed shadow-none" 
            : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/15 hover:scale-[1.01] active:scale-[0.99] border-0"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Analyzing details...</span>
          </>
        ) : (
          <>
            <span>Analyze decision</span>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
