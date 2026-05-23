import { useState } from 'react';
import { Scale, Table as TableIcon, Zap, X, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { AnalysisType } from '../types';

export function AnalysisForm({ onAnalyze, isLoading, error }: { onAnalyze: (d: string, t: AnalysisType) => void, isLoading: boolean, error: string | null }) {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<AnalysisType>("pros_cons");

  return (
    <div className="space-y-8 w-full max-w-full">
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => {
            if (e.target.value.length <= 1000) {
              setPrompt(e.target.value);
            }
          }}
          placeholder="e.g., Should I quit my job and start a startup?"
          className="w-full h-44 pb-12 p-4 md:p-6 text-lg md:text-xl font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 resize-none transition-all placeholder:text-slate-300"
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          <span className={cn(
            "text-xs font-semibold font-mono",
            prompt.length > 900 ? "text-amber-500" : "text-slate-300"
          )}>
            {prompt.length}/1000
          </span>
          {prompt && (
            <button 
              onClick={() => setPrompt("")}
              className="p-1 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full"
              aria-label="Clear prompt"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { id: 'pros_cons', label: 'Pros & Cons', icon: Scale },
          { id: 'swot', label: 'SWOT Analysis', icon: Zap },
          { id: 'comparison', label: 'Comparison', icon: TableIcon },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setType(opt.id as AnalysisType)}
            className={cn(
              "flex flex-row sm:flex-col items-center gap-3 p-4 sm:p-5 rounded-xl border transition-all justify-start sm:justify-center",
              type === opt.id 
                ? "bg-slate-50 border-slate-900 text-slate-900" 
                : "border-slate-100 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600"
            )}
          >
            <opt.icon className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-[10px] font-bold uppercase tracking-wider">
              {opt.label}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <button
        disabled={!prompt || isLoading}
        onClick={() => onAnalyze(prompt, type)}
        className={cn(
          "w-full py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-3",
          !prompt || isLoading 
            ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
            : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <span>Analyze decision</span>
            <ChevronRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}
