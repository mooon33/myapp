import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Sword, Shield, Loader2, AlertCircle, User, Mail, ArrowLeft, Globe, RefreshCw } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface Props {
  currentLang: 'en' | 'ru';
  onToggleLang: (lang: 'en' | 'ru') => void;
}

const AuthView: React.FC<Props> = ({ currentLang = 'en', onToggleLang }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const t = TRANSLATIONS[currentLang];

  // Auto-check for session when on "Check Email" screen
  useEffect(() => {
    let interval: any;
    if (checkEmail) {
        // Listen for auth changes (e.g. user verified in another tab)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                // App.tsx will handle the view change, we just need to ensure we don't block it
                setCheckEmail(false);
            }
        });

        // Polling as a fallback
        interval = setInterval(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setCheckEmail(false);
            }
        }, 2000);

        return () => {
            subscription.unsubscribe();
            clearInterval(interval);
        };
    }
  }, [checkEmail]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (username.length < 3) {
            throw new Error(t.usernameError);
        }

        // Check uniqueness of username in DB
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single();

        if (existingUser) {
           throw new Error(t.usernameTaken);
        }
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            },
            // CRITICAL: This ensures the user is redirected back to the app 
            // with a session token after clicking the email link.
            emailRedirectTo: window.location.origin 
          }
        });
        
        if (error) throw error;

        // If 'Confirm Email' is disabled in Supabase, data.session will be present immediately.
        // If it is enabled, data.session is null.
        if (data.user && !data.session) {
            setCheckEmail(true);
        }
        // If data.session exists, App.tsx will automatically detect the state change via onAuthStateChange

      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || t.authError);
    } finally {
      setLoading(false);
    }
  };

  const toggleLang = () => {
    onToggleLang(currentLang === 'en' ? 'ru' : 'en');
  };

  if (checkEmail) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl relative z-10 text-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-700 mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)] mx-auto animate-pulse">
            <Mail className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t.checkScrolls}</h2>
          <p className="text-slate-400 mb-8 leading-relaxed text-sm">
            {t.verificationSent} <br/>
            <span className="font-bold text-white text-base mt-1 inline-block bg-slate-800 px-3 py-1 rounded">{email}</span>
            <br/><br/>
            {t.confirmEmail}
          </p>
          
          <div className="space-y-3">
             <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                Waiting for confirmation...
             </div>

             <button 
                onClick={() => {
                  setCheckEmail(false);
                  setIsSignUp(false);
                }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700"
             >
                <ArrowLeft className="w-4 h-4" /> {t.returnLogin}
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      {/* Language Toggle */}
      <button 
        onClick={toggleLang}
        className="absolute top-4 right-4 z-20 flex items-center gap-2 text-slate-400 hover:text-white bg-slate-900/50 p-2 rounded-lg border border-slate-700"
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs font-bold uppercase">{currentLang === 'en' ? 'EN' : 'RU'}</span>
      </button>

      <div className="w-full max-w-md bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-700 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Sword className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">IronQuest RPG</h1>
          <p className="text-slate-400 mt-2 text-sm">Forge your legacy through sweat and iron.</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 p-3 rounded-lg flex items-center gap-2 text-red-200 text-sm animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {isSignUp && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.heroName}</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                    type="text"
                    required={isSignUp}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-3 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                    placeholder="Sir Liftsalot"
                    />
                </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.emailScroll}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              placeholder="hero@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.secretRune}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isSignUp ? (
              <>
                <Shield className="w-5 h-5" /> {t.beginJourney}
              </>
            ) : (
              <>
                <Sword className="w-5 h-5" /> {t.enterRealm}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-slate-400 hover:text-white text-sm font-medium underline decoration-slate-600 underline-offset-4"
          >
            {isSignUp ? t.alreadyHero : t.newHero}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;