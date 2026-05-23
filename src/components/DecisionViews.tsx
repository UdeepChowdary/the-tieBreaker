import { memo, useCallback, useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { History, Zap, Check, X, Shield, Cpu, Scale, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Decision, ProsConsData, SwotData, ComparisonData, ProCon } from '../types';

const formatDate = (dateVal: any) => {
  if (!dateVal) return '';
  if (typeof dateVal === 'object' && dateVal !== null && 'toDate' in dateVal && typeof dateVal.toDate === 'function') {
    return dateVal.toDate().toLocaleDateString();
  }
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString();
    }
  } catch {}
  return String(dateVal);
};

export function DecisionResult({ decision, onUpdateWeights }: { decision: Decision, onUpdateWeights: (w: Record<string, number>) => void }) {
  const [weights, setWeights] = useState<Record<string, number>>(decision.weights || {});

  useEffect(() => {
    setWeights(decision.weights || {});
  }, [decision]);

  const handleWeightChange = useCallback((key: string, val: number) => {
    setWeights(prev => {
      const newWeights = { ...prev, [key]: val };
      onUpdateWeights(newWeights);
      return newWeights;
    });
  }, [onUpdateWeights]);

  return (
    <>
      <header className="h-20 border-b border-[#1E2030]/60 flex items-center justify-between px-6 sticky top-0 bg-[#08090E]/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-4 truncate">
          <h2 className="text-base md:text-xl font-black text-white tracking-tight truncate leading-none">{decision.title}</h2>
          <span className="hidden sm:inline-block px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[9px] font-extrabold uppercase rounded-full tracking-wider shrink-0">
            {decision.analysisType.replace('_', ' ')}
          </span>
        </div>
        <div className="text-[10px] font-bold font-mono text-slate-400 bg-slate-900 border border-[#1E2030] px-2.5 py-1.5 rounded-xl uppercase tracking-wider shrink-0 ml-4">
          {formatDate(decision.createdAt)}
        </div>
      </header>
      
      <div className="flex-1 p-5 md:p-8 overflow-y-auto z-10 bg-transparent">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            {decision.analysisType === 'pros_cons' && (
              <ProsConsView data={decision.analysisData as ProsConsData} weights={weights} onChangeWeight={handleWeightChange} />
            )}
            {decision.analysisType === 'swot' && (
              <SwotView data={decision.analysisData as SwotData} />
            )}
            {decision.analysisType === 'comparison' && (
              <ComparisonView data={decision.analysisData as ComparisonData} />
            )}

            <div className="p-6 border border-[#1E2030]/60 rounded-3xl bg-[#12131C]/45 backdrop-blur-md shadow-lg shadow-black/10 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full glow-spot-violet opacity-25 pointer-events-none" />
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-lg flex items-center justify-center shrink-0">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">AI Insight</h3>
              </div>
              <div className="text-sm leading-relaxed text-slate-300 prose prose-invert max-w-none prose-sm prose-p:leading-relaxed">
                <Markdown>{(decision.analysisData as any).summary || (decision.analysisData as any).conclusion}</Markdown>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-28">
            {decision.analysisType === 'pros_cons' && (
              <TotalScore weights={weights} data={decision.analysisData as ProsConsData} />
            )}
            
            <div className="p-5 border border-[#1E2030]/60 rounded-2xl bg-[#12131C]/20 flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-500" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Meta Info</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Analysis conducted using real-time Gemini AI models. Individual weights were manually adjusted locally to reflect personal priorities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const ProsConsView = memo(function ProsConsView({ data, weights, onChangeWeight }: { data: ProsConsData, weights: Record<string, number>, onChangeWeight: (k: string, v: number) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Scale className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Pros</h3>
        </div>
        <div className="space-y-3">
          {data.pros.map(p => (
            <PointCard 
              key={p.id} 
              point={p} 
              weight={weights[p.id] || 1} 
              onChange={(v) => onChangeWeight(p.id, v)}
              type="pro"
            />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Scale className="w-4 h-4 text-rose-400 rotate-180" />
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Cons</h3>
        </div>
        <div className="space-y-3">
          {data.cons.map(c => (
            <PointCard 
              key={c.id} 
              point={c} 
              weight={weights[c.id] || 1} 
              onChange={(v) => onChangeWeight(c.id, v)}
              type="con"
            />
          ))}
        </div>
      </div>
    </div>
  );
});

const PointCard = memo(function PointCard({ point, weight, onChange, type }: { point: ProCon, weight: number, onChange: (v: number) => void, type: 'pro' | 'con' }) {
  return (
    <div className={cn(
      "p-4 border rounded-2xl bg-[#12131C]/35 flex flex-col gap-2.5 transition-all duration-300 hover:bg-[#151724]/75 relative overflow-hidden group",
      type === 'pro' ? "border-[#1E2030] hover:border-emerald-500/20" : "border-[#1E2030] hover:border-rose-500/20"
    )}>
      {type === 'pro' ? (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500/30 group-hover:bg-emerald-500 transition-colors" />
      ) : (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-rose-500/30 group-hover:bg-rose-500 transition-colors" />
      )}
      <div className="flex justify-between items-start gap-4">
        <span className="text-sm font-bold text-white leading-snug">{point.text}</span>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-[#1E2030] p-1 rounded-xl shadow-inner">
            <button 
              aria-label="Decrease weight" 
              onClick={() => onChange(Math.max(1, weight - 1))} 
              className="w-5 h-5 flex items-center justify-center text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-md font-extrabold cursor-pointer transition-colors"
            >
              -
            </button>
            <span className="font-mono text-[9px] w-5 text-center font-bold text-slate-300">W:{weight}</span>
            <button 
              aria-label="Increase weight" 
              onClick={() => onChange(Math.min(5, weight + 1))} 
              className="w-5 h-5 flex items-center justify-center text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-md font-extrabold cursor-pointer transition-colors"
            >
              +
            </button>
          </div>
          <span className={cn(
            "px-2 py-1 text-[9px] font-black rounded-lg shrink-0 select-none shadow-sm uppercase font-mono tracking-wider",
            type === 'pro' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          )}>
            {type === 'pro' ? '+' : '-'}{weight}
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed font-medium">{point.explanation}</p>
    </div>
  );
});

export const TotalScore = memo(function TotalScore({ weights, data }: { weights: Record<string, number>, data: ProsConsData }) {
  const proScore = data.pros.reduce((acc, p) => acc + (weights[p.id] || 1), 0);
  const conScore = data.cons.reduce((acc, c) => acc + (weights[c.id] || 1), 0);
  const diff = proScore - conScore;

  return (
    <div className={cn(
      "rounded-3xl p-6 md:p-8 text-white flex flex-col justify-center items-center text-center relative overflow-hidden border",
      diff > 0 
        ? "bg-gradient-to-br from-[#12131C] to-[#0A1A14] border-emerald-500/15 neon-glow-emerald" 
        : diff < 0 
          ? "bg-gradient-to-br from-[#12131C] to-[#1C0A0D] border-rose-500/15 neon-glow-rose" 
          : "bg-[#12131C] border-[#1E2030] neon-glow-violet"
    )}>
      {/* Light Blooms inside card */}
      {diff > 0 && <div className="absolute inset-0 glow-spot-emerald opacity-20 pointer-events-none" />}
      {diff < 0 && <div className="absolute inset-0 glow-spot-rose opacity-20 pointer-events-none" />}

      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 z-10 select-none">
        Tiebreaker Score
      </div>
      <motion.div 
        key={diff}
        initial={{ scale: 0.9, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={cn(
          "text-6xl md:text-7xl font-black mb-3 tracking-tight select-none z-10 leading-none",
          diff > 0 ? "text-emerald-400" : diff < 0 ? "text-rose-400" : "text-violet-400"
        )}
      >
        {diff > 0 ? `+${diff}` : diff}
      </motion.div>
      <div className="h-1.5 w-full bg-slate-950 rounded-full mt-4 overflow-hidden z-10 border border-[#1E2030]/20 flex">
        <div 
          className={cn("h-full transition-all duration-1000", diff >= 0 ? "bg-emerald-500 shadow-md shadow-emerald-500/20" : "bg-rose-500 shadow-md shadow-rose-500/20")} 
          style={{ width: `${Math.min(100, (Math.abs(diff) / Math.max(proScore, conScore, 1)) * 100)}%` }}
        />
      </div>
      <div className="mt-6 text-xs text-slate-400 leading-relaxed font-semibold z-10">
        {diff > 0 
          ? "The pros outweigh the cons when adjusted for your priority weighting." 
          : diff < 0 
            ? "The cons outweigh the pros based on your current priorities." 
            : "The analysis is perfectly balanced at the moment."}
      </div>
    </div>
  );
});

function SwotView({ data }: { data: SwotData }) {
  const sections = [
    { title: 'Strengths', data: data.strengths, icon: Check, color: 'emerald' },
    { title: 'Weaknesses', data: data.weaknesses, icon: X, color: 'rose' },
    { title: 'Opportunities', data: data.opportunities, icon: Zap, color: 'cyan' },
    { title: 'Threats', data: data.threats, icon: History, color: 'amber' },
  ];

  return (
    <div className="border border-[#1E2030]/60 rounded-3xl p-5 md:p-6 bg-[#12131C]/20">
      <div className="flex items-center gap-2 mb-5 px-1">
        <Shield className="w-4 h-4 text-violet-400" />
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">SWOT Analysis</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
        {sections.map(s => (
          <div 
            key={s.title} 
            className={cn(
              "p-4 border rounded-2xl bg-[#12131C]/35 relative group",
              s.color === 'emerald' ? "border-[#1E2030] hover:border-emerald-500/15" :
              s.color === 'rose' ? "border-[#1E2030] hover:border-rose-500/15" :
              s.color === 'cyan' ? "border-[#1E2030] hover:border-cyan-500/15" :
              "border-[#1E2030] hover:border-amber-500/15"
            )}
          >
            <div className="font-extrabold mb-3.5 flex items-center gap-2 text-white">
              <div className={cn(
                "w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border",
                s.color === 'emerald' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                s.color === 'rose' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                s.color === 'cyan' ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" :
                "bg-amber-500/10 border-amber-500/20 text-amber-400"
              )}>
                <s.icon className="w-3 h-3" />
              </div>
              <span className="tracking-wide uppercase text-[10px]">{s.title}</span>
            </div>
            <ul className="space-y-2">
              {s.data.map((item, i) => (
                <li key={i} className="text-slate-300 text-xs flex items-start gap-2 leading-relaxed">
                  <span className={cn(
                    "text-xs leading-none mt-1 font-bold select-none shrink-0",
                    s.color === 'emerald' ? "text-emerald-500" :
                    s.color === 'rose' ? "text-rose-500" :
                    s.color === 'cyan' ? "text-cyan-500" :
                    "text-amber-500"
                  )}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonView({ data }: { data: ComparisonData }) {
  const maxPoints = Math.max(...data.options.map(o => o.points.length), 0);
  const numOptions = data.options.length;

  return (
    <div className="border border-[#1E2030]/60 rounded-3xl p-5 md:p-6 bg-[#12131C]/20 flex flex-col gap-4 relative overflow-hidden">
      {/* Subtle glowing bloom inside the comparison board */}
      <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full glow-spot-violet opacity-[0.08] pointer-events-none" />

      {/* Option Headers */}
      <div className={cn(
        "grid gap-4 items-stretch",
        numOptions === 2 ? "grid-cols-1 md:grid-cols-2" : `grid-cols-1 md:grid-cols-${numOptions}`
      )}>
        {data.options.map((opt, i) => (
          <div key={i} className="p-4 bg-gradient-to-r from-[#12131C]/90 to-slate-950/90 text-white flex items-center justify-between border border-[#1E2030]/80 rounded-2xl shadow-lg shadow-black/20">
            <h3 className="text-xs font-extrabold tracking-widest uppercase text-white leading-none font-heading">{opt.name}</h3>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse shrink-0 ml-4 shadow-sm shadow-violet-400/50" />
          </div>
        ))}
      </div>

      {/* Point Rows aligned perfectly row-by-row */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: maxPoints }).map((_, j) => (
          <div 
            key={j} 
            className={cn(
              "grid gap-4 items-stretch",
              numOptions === 2 ? "grid-cols-1 md:grid-cols-2" : `grid-cols-1 md:grid-cols-${numOptions}`
            )}
          >
            {data.options.map((opt, i) => {
              const point = opt.points[j];
              return (
                <div 
                  key={i} 
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-2xl border transition-all duration-300 min-h-[4.5rem] h-full",
                    point 
                      ? "bg-[#12131C]/35 border-[#1E2030] hover:border-violet-500/20 hover:bg-[#151724]/75 shadow-sm shadow-black/5" 
                      : "bg-[#12131C]/5 border-dashed border-[#1E2030]/30 opacity-40 select-none"
                  )}
                >
                  {point ? (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-violet-400 to-indigo-400 mt-[6px] shrink-0 shadow shadow-violet-500/50" />
                      <p className="text-xs text-slate-300 leading-relaxed font-semibold">{point}</p>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic font-mono leading-relaxed mt-0.5">No corresponding factor</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
