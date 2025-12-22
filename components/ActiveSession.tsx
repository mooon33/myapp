import React, { useState, useEffect } from 'react';
import { WorkoutNode, UserProfile } from '../types';
import { getWorkoutMotivation, getTechniqueTip } from '../services/geminiService';
import { ArrowLeft, Timer, CheckCircle, Info, Bot, Trophy, Star, Sparkles, Users } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface Props {
  workout: WorkoutNode;
  user: UserProfile;
  lang: 'en' | 'ru';
  partnerName?: string | null;
  onComplete: (xp: number, gold: number) => void;
  onExit: () => void;
}

const ActiveSession: React.FC<Props> = ({ workout, user, lang, partnerName, onComplete, onExit }) => {
  const [motivation, setMotivation] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [activeTip, setActiveTip] = useState<string | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [partnerProgress, setPartnerProgress] = useState(0);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const fetchIntro = async () => {
      setLoadingAI(true);
      const text = await getWorkoutMotivation(user, workout);
      setMotivation(text);
      setLoadingAI(false);
    };
    fetchIntro();
  }, []);

  // Simulate Partner Progress
  useEffect(() => {
    if (partnerName) {
        const interval = setInterval(() => {
            setPartnerProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                // Random increment
                return Math.min(100, prev + Math.random() * 5); 
            });
        }, 3000);
        return () => clearInterval(interval);
    }
  }, [partnerName]);

  const toggleExercise = (id: string) => {
    const next = new Set(completedExercises);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCompletedExercises(next);
  };

  const handleGetTip = async (exerciseName: string) => {
    setActiveTip("Consulting the archives...");
    const tip = await getTechniqueTip(exerciseName);
    setActiveTip(tip);
  };

  const handleFinish = () => {
    setShowVictory(true);
  };

  const handleClaimReward = () => {
    onComplete(workout.xpReward, workout.goldReward);
  };

  const isFinished = completedExercises.size === workout.exercises.length;

  // --- VICTORY SCREEN ---
  if (showVictory) {
    return (
      <div className="fixed inset-0 z-50 h-[100dvh] w-[100vw] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-500 overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl aspect-square bg-gradient-radial from-amber-500/10 to-transparent blur-[100px] animate-pulse"></div>
           {/* Rotating light rays simulation */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[10px] bg-amber-500/5 rotate-45 blur-xl"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[10px] bg-amber-500/5 -rotate-45 blur-xl"></div>
        </div>

        <div className="w-full max-w-sm h-full max-h-[100dvh] flex flex-col items-center justify-center p-6 relative overflow-y-auto">
          
          {/* Animated Trophy Container */}
          <div className="mb-8 relative animate-in zoom-in duration-700 ease-out py-6">
             <div className="absolute inset-0 bg-amber-500/30 blur-3xl rounded-full animate-pulse"></div>
             <Trophy className="w-40 h-40 text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] relative z-10" />
             
             {/* Sparkles */}
             <Sparkles className="w-8 h-8 text-yellow-100 absolute -top-0 -right-4 animate-bounce duration-[2000ms]" />
             <Sparkles className="w-6 h-6 text-amber-200 absolute bottom-4 -left-6 animate-bounce delay-300 duration-[1500ms]" />
             <Star className="w-4 h-4 text-yellow-300 absolute top-10 -left-2 animate-ping duration-[3000ms]" />
          </div>

          {/* Text */}
          <h1 className="text-5xl font-black italic uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-500 to-amber-700 mb-2 drop-shadow-sm animate-in slide-in-from-bottom-4 duration-700 delay-100 text-center leading-tight">
            {t.questComplete}
          </h1>
          <p className="text-slate-300 font-medium mb-10 animate-in slide-in-from-bottom-4 duration-700 delay-200 text-center px-4">
            {workout.title} <span className="text-amber-500 font-bold">{t.completed}</span>
          </p>

          {/* Rewards Cards */}
          <div className="grid grid-cols-2 gap-4 w-full mb-8 max-w-[300px]">
             <div className="bg-slate-900 border border-violet-500/30 p-4 rounded-2xl flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-300 shadow-[0_0_20px_rgba(139,92,246,0.15)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors"></div>
                <span className="text-xs uppercase font-bold text-violet-400 mb-1 z-10">{t.xp}</span>
                <span className="text-3xl font-black text-white z-10">+{workout.xpReward}</span>
             </div>

             <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-2xl flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors"></div>
                <span className="text-xs uppercase font-bold text-amber-400 mb-1 z-10">Gold</span>
                <span className="text-3xl font-black text-white z-10">+{workout.goldReward}</span>
             </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleClaimReward}
            className="w-full max-w-[300px] py-4 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-lg uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] transform transition-all active:scale-95 animate-in fade-in duration-1000 delay-700 flex items-center justify-center gap-2 mb-4"
          >
             <Star className="w-6 h-6 fill-slate-950" /> {t.reward}
          </button>

        </div>
      </div>
    );
  }

  // --- STANDARD SESSION VIEW ---
  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-4 bg-slate-900 sticky top-0 z-20">
        <button onClick={onExit} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white leading-none">{workout.title}</h2>
          <span className="text-xs text-amber-500 font-mono">{t.reward}: {workout.xpReward} {t.xp}</span>
        </div>
        {partnerName && (
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-xs font-bold text-green-400">
                    <Users className="w-3 h-3" /> {partnerName}
                </div>
                <div className="w-16 h-1.5 bg-slate-800 rounded-full mt-1">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{width: `${partnerProgress}%`}}></div>
                </div>
            </div>
        )}
      </div>

      {/* AI Oracle Message */}
      <div className="p-4 bg-violet-900/20 border-b border-violet-900/50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-violet-600 rounded-lg shrink-0">
             <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-violet-300 uppercase mb-1">{t.oracleGuidance}</h4>
            <p className="text-sm text-violet-100 italic">
              {loadingAI ? "Communining with the spirits..." : `"${motivation}"`}
            </p>
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {workout.exercises.map((ex) => {
          const isDone = completedExercises.has(ex.id);
          return (
            <div 
              key={ex.id} 
              className={`p-4 rounded-xl border transition-all duration-300 ${
                isDone ? 'bg-green-900/20 border-green-800 opacity-70' : 'bg-slate-900 border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className={`text-lg font-bold ${isDone ? 'text-green-400' : 'text-slate-100'}`}>
                    {ex.name}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {ex.sets} sets × {ex.reps} reps {ex.weight ? `@ ${ex.weight}kg` : ''}
                  </p>
                </div>
                <button 
                  onClick={() => toggleExercise(ex.id)}
                  className={`p-2 rounded-full border-2 ${
                    isDone 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-slate-600 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <CheckCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="flex gap-2">
                <button 
                   onClick={() => handleGetTip(ex.name)}
                   className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-slate-800 text-blue-400 hover:bg-slate-700 transition-colors"
                >
                  <Info className="w-3 h-3" /> {t.techniqueTip}
                </button>
                <button className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700">
                  <Timer className="w-3 h-3" /> {t.restTimer}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overlay Tip */}
      {activeTip && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setActiveTip(null)}>
            <div className="bg-slate-900 border border-slate-600 p-6 rounded-xl max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
               <h3 className="text-lg font-bold text-blue-400 mb-2 flex items-center gap-2">
                  <Bot className="w-5 h-5" /> {t.techniqueTip}
               </h3>
               <p className="text-slate-200 text-sm leading-relaxed">{activeTip}</p>
               <button 
                onClick={() => setActiveTip(null)}
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm font-bold uppercase"
               >
                {t.gotIt}
               </button>
            </div>
         </div>
      )}

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950 border-t border-slate-800 md:max-w-md md:mx-auto z-30">
        <button
          disabled={!isFinished}
          onClick={handleFinish}
          className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${
            isFinished 
              ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isFinished ? t.completeQuest : `${completedExercises.size}/${workout.exercises.length} ${t.completed}`}
        </button>
      </div>
    </div>
  );
};

export default ActiveSession;