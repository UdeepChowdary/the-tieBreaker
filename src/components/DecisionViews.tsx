import { memo, useCallback, useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { History, Zap, Check, X } from 'lucide-react';
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
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4 truncate">
          <h2 className="text-sm md:text-lg font-bold tracking-tight truncate">{decision.title}</h2>
          <span className="hidden sm:inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded tracking-wide shrink-0">
            {decision.analysisType.replace('_', ' ')}
          </span>
        </div>
        <div className="text-[10px] md:text-xs text-slate-400 font-medium shrink-0 ml-4">
          {formatDate(decision.createdAt)}
        </div>
      </header>
      
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-8">
            {decision.analysisType === 'pros_cons' && (
              <ProsConsView data={decision.analysisData as ProsConsData} weights={weights} onChangeWeight={handleWeightChange} />
            )}
            {decision.analysisType === 'swot' && (
              <SwotView data={decision.analysisData as SwotData} />
            )}
            {decision.analysisType === 'comparison' && (
              <ComparisonView data={decision.analysisData as ComparisonData} />
            )}

            <div className="p-4 md:p-6 border border-slate-100 rounded-2xl bg-white shadow-sm flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Insight</h3>
              <div className="text-sm leading-relaxed text-slate-600 prose prose-slate max-w-none">
                <Markdown>{(decision.analysisData as any).summary || (decision.analysisData as any).conclusion}</Markdown>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col gap-6">
            {decision.analysisType === 'pros_cons' && (
              <TotalScore weights={weights} data={decision.analysisData as ProsConsData} />
            )}
            
            <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50/30 flex flex-col gap-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meta Info</h3>
              <p className="text-xs text-slate-500">Analysis conducted using Gemini AI models. Individual weights were manually adjusted by the user to reflect personal priorities.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const ProsConsView = memo(function ProsConsView({ data, weights, onChangeWeight }: { data: ProsConsData, weights: Record<string, number>, onChangeWeight: (k: string, v: number) => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pros</h3>
        <div className="space-y-2">
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
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cons</h3>
        <div className="space-y-2">
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
    <div className="p-3 border border-slate-100 rounded-lg bg-white flex flex-col gap-2 hover:border-slate-300 transition-colors">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-900">{point.text}</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded border border-slate-100">
            <button aria-label="Decrease weight" onClick={() => onChange(Math.max(1, weight - 1))} className="w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center text-xs hover:bg-white rounded transition-colors">-</button>
            <span className="font-mono text-[10px] w-4 text-center font-bold">W:{weight}</span>
            <button aria-label="Increase weight" onClick={() => onChange(Math.min(5, weight + 1))} className="w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center text-xs hover:bg-white rounded transition-colors">+</button>
          </div>
          <span className={cn(
            "px-2 py-0.5 text-[10px] font-bold rounded",
            type === 'pro' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          )}>
            {type === 'pro' ? '+' : '-'}{weight}
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{point.explanation}</p>
    </div>
  );
});

export const TotalScore = memo(function TotalScore({ weights, data }: { weights: Record<string, number>, data: ProsConsData }) {
  const proScore = data.pros.reduce((acc, p) => acc + (weights[p.id] || 1), 0);
  const conScore = data.cons.reduce((acc, c) => acc + (weights[c.id] || 1), 0);
  const diff = proScore - conScore;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white h-full flex flex-col justify-center items-center text-center">
      <div className="text-[11px] uppercase tracking-[0.2em] opacity-60 mb-2">Calculated Tiebreaker</div>
      <div className="text-6xl font-light mb-2">{diff > 0 ? `+${diff}` : diff}</div>
      <div className="h-1 w-full bg-slate-800 rounded-full mt-4 overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-1000", diff >= 0 ? "bg-green-500" : "bg-red-500")} 
          style={{ width: `${Math.min(100, (Math.abs(diff) / Math.max(proScore, conScore, 1)) * 100)}%` }}
        />
      </div>
      <div className="mt-6 text-sm text-slate-400 leading-relaxed">
        {diff > 0 
          ? "The pros marginally outweigh the cons when adjusted for your priority weighting." 
          : diff < 0 
            ? "The cons outweigh the pros based on your current priorities." 
            : "The analysis is perfectly balanced at the moment."}
      </div>
    </div>
  );
});

function SwotView({ data }: { data: SwotData }) {
  const sections = [
    { title: 'Strengths', data: data.strengths, icon: Check },
    { title: 'Weaknesses', data: data.weaknesses, icon: X },
    { title: 'Opportunities', data: data.opportunities, icon: Zap },
    { title: 'Threats', data: data.threats, icon: History },
  ];

  return (
    <div className="border border-slate-100 rounded-xl p-4 md:p-6 bg-slate-50/50">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">SWOT Analysis</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {sections.map(s => (
          <div key={s.title} className="p-3 bg-white border border-slate-100 rounded-md shadow-sm">
            <div className="font-bold mb-1 flex items-center gap-2">
              <s.icon className="w-3 h-3 opacity-40" />
              {s.title}
            </div>
            <ul className="space-y-1">
              {s.data.map((item, i) => (
                <li key={i} className="text-slate-600">• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonView({ data }: { data: ComparisonData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {data.options.map((opt, i) => (
        <div key={i} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight uppercase tracking-wider">{opt.name}</h3>
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          </div>
          <div className="p-6 space-y-3">
            {opt.points.map((p, j) => (
              <div key={j} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{p}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
