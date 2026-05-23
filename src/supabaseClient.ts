import { createClient } from '@supabase/supabase-js';
import { Decision } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Mock mode is active if Supabase credentials are not provided or are placeholders
export const isMockMode = !supabaseUrl || 
                           supabaseUrl.includes('YOUR_') || 
                           supabaseUrl === '' ||
                           !supabaseAnonKey || 
                           supabaseAnonKey.includes('YOUR_');

// Let's allow a manual local bypass (Guest Mode) if the user is rate-limited by email
let localBypassActive = localStorage.getItem('local_bypass_active') === 'true';

export const setLocalBypass = (active: boolean) => {
  localBypassActive = active;
  if (active) {
    localStorage.setItem('local_bypass_active', 'true');
  } else {
    localStorage.removeItem('local_bypass_active');
  }
};

export const getIsMockMode = () => {
  return true; // Force local offline storage since login is removed
};

// Real client instantiation
const realSupabase = !isMockMode 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock client implementation
const mockSupabase = {
  auth: {
    onAuthStateChange: (callback: any) => {
      const email = localStorage.getItem('mock_user_email');
      const mockUser = {
        id: 'mock-user-123',
        email: email || 'guest@example.com',
      };
      const session = email ? { user: mockUser, access_token: 'mock-token' } : null;
      
      // Call callback immediately with initial state
      setTimeout(() => {
        callback('SIGNED_IN', session);
      }, 100);

      (globalThis as any).__authListeners = (globalThis as any).__authListeners || [];
      (globalThis as any).__authListeners.push(callback);

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const listeners = (globalThis as any).__authListeners || [];
              (globalThis as any).__authListeners = listeners.filter((l: any) => l !== callback);
            }
          }
        }
      };
    },
    getSession: async () => {
      return {
        data: {
          session: {
            user: { id: 'local-default-user', email: 'guest@example.com' },
            access_token: 'mock-token'
          }
        },
        error: null
      };
    },
    signInWithOtp: async ({ email }: { email: string }) => {
      localStorage.setItem('mock_user_email', email);
      const mockUser = { id: 'mock-user-123', email };
      const session = { user: mockUser, access_token: 'mock-token' };
      const listeners = (globalThis as any).__authListeners || [];
      listeners.forEach((callback: any) => callback('SIGNED_IN', session));
      return { data: { user: mockUser }, error: null };
    },
    signOut: async () => {
      localStorage.removeItem('mock_user_email');
      const listeners = (globalThis as any).__authListeners || [];
      listeners.forEach((callback: any) => callback('SIGNED_OUT', null));
      return { error: null };
    }
  }
} as any;

// Use ES6 Proxy to dynamically switch supabase client based on mock/bypass states
export const supabase = new Proxy({} as any, {
  get: (_target, prop) => {
    const activeClient = getIsMockMode() ? mockSupabase : realSupabase;
    return activeClient?.[prop];
  }
});

export const loginWithEmail = async (email: string) => {
  if (getIsMockMode()) {
    await supabase.auth.signInWithOtp({ email });
    return;
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin
    }
  });
  if (error) throw error;
};

export const logout = async () => {
  if (getIsMockMode()) {
    setLocalBypass(false);
  }
  return supabase.auth.signOut();
};

const getLocalDecisions = (): Decision[] => {
  try {
    const raw = localStorage.getItem('mock_decisions');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalDecisions = (decisions: Decision[]) => {
  localStorage.setItem('mock_decisions', JSON.stringify(decisions));
};

export const saveDecision = async (decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (getIsMockMode()) {
    const local = getLocalDecisions();
    const newDecision: Decision = {
      ...decision,
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    local.unshift(newDecision);
    saveLocalDecisions(local);
    
    // trigger listeners
    const listeners = (globalThis as any).__decisionListeners || [];
    listeners.forEach((callback: any) => callback(local));
    
    return newDecision.id;
  }

  const { data, error } = await supabase
    .from('decisions')
    .insert([{
      userId: decision.userId,
      title: decision.title,
      description: decision.description || null,
      analysisType: decision.analysisType,
      analysisData: decision.analysisData,
      weights: decision.weights,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data.id as string;
};

export const updateDecisionWeights = async (id: string, weights: Record<string, number>) => {
  if (getIsMockMode()) {
    const local = getLocalDecisions();
    const index = local.findIndex(d => d.id === id);
    if (index !== -1) {
      local[index] = {
        ...local[index],
        weights,
        updatedAt: new Date().toISOString()
      };
      saveLocalDecisions(local);
      
      const listeners = (globalThis as any).__decisionListeners || [];
      listeners.forEach((callback: any) => callback(local));
    }
    return;
  }

  const { error } = await supabase
    .from('decisions')
    .update({ 
      weights,
      updatedAt: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw error;
};

export const deleteDecision = async (id: string) => {
  if (getIsMockMode()) {
    const local = getLocalDecisions();
    const filtered = local.filter(d => d.id !== id);
    saveLocalDecisions(filtered);
    
    const listeners = (globalThis as any).__decisionListeners || [];
    listeners.forEach((callback: any) => callback(filtered));
    return;
  }

  const { error } = await supabase
    .from('decisions')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const subscribeToDecisions = (userId: string, callback: (decisions: Decision[]) => void) => {
  if (getIsMockMode()) {
    const local = getLocalDecisions();
    // call callback immediately
    setTimeout(() => {
      callback(local);
    }, 50);

    (globalThis as any).__decisionListeners = (globalThis as any).__decisionListeners || [];
    (globalThis as any).__decisionListeners.push(callback);

    return () => {
      const listeners = (globalThis as any).__decisionListeners || [];
      (globalThis as any).__decisionListeners = listeners.filter((l: any) => l !== callback);
    };
  }

  const fetchDecisions = () => {
    supabase
      .from('decisions')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .then(({ data, error }) => {
        if (data && !error) {
          callback(data as Decision[]);
        }
      });
  };

  fetchDecisions();

  const channel = supabase.channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'decisions', filter: `userId=eq.${userId}` },
      () => {
        fetchDecisions();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
