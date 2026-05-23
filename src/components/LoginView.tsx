import { motion } from 'motion/react';
import { Scale, Mail, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { setLocalBypass } from '../supabaseClient';

export function LoginView({ onLogin }: { onLogin: (email: string) => Promise<any> | void }) {
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      setIsLoading(true);
      setError(null);
      await onLogin(email);
      setIsSent(true);
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Failed to send magic link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    setLocalBypass(true);
    onLogin("guest@example.com");
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F5F5F5] px-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md p-8 md:p-12 bg-white rounded-[32px] border border-[#141414]/10 shadow-xl text-center"
      >
        <Scale className="w-16 h-16 mx-auto mb-8 text-slate-800" />
        <h1 className="text-4xl font-medium tracking-tight mb-4">The Tiebreaker</h1>
        <p className="text-sm md:text-base text-[#141414]/60 mb-8">Make informed decisions with AI-powered analysis and weighted scoring.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl text-xs font-medium text-left flex flex-col gap-2 relative">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold uppercase tracking-wider text-[10px]">Security Notice</span>
            </div>
            <p className="leading-relaxed">{error}</p>
            <button 
              type="button" 
              onClick={handleGuestMode} 
              className="mt-2 text-center text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-2 px-3 font-semibold transition-colors"
            >
              Skip and Enter Guest Mode 🚀
            </button>
          </div>
        )}

        {isSent ? (
          <div className="p-6 bg-green-50 text-green-700 rounded-2xl border border-green-100">
            <Mail className="w-8 h-8 mx-auto mb-2 text-green-600 animate-bounce" />
            <h3 className="font-bold mb-1">Check your email!</h3>
            <p className="text-xs opacity-90 leading-relaxed">We've sent a magic link to <strong>{email}</strong>.<br />Click the link to log in instantly.</p>
            <button 
              type="button"
              onClick={handleGuestMode}
              className="mt-6 w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Want to skip email? Enter Guest Mode instead
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
            <button 
              type="submit"
              disabled={isLoading || !email}
              className="w-full py-4 px-6 bg-[#141414] text-white rounded-2xl font-bold text-lg hover:bg-[#141414]/90 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              <span>{isLoading ? "Sending..." : "Send Magic Link"}</span>
              {!isLoading && <Mail className="w-5 h-5" />}
            </button>

            <div className="relative my-2 flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button 
              type="button"
              onClick={handleGuestMode}
              className="w-full py-4 px-6 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <span>Try offline Guest Mode 🚀</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
