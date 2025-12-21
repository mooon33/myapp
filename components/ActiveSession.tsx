import React, { useState, useEffect } from 'react';
import { WorkoutNode, UserProfile } from '../types';
import { getWorkoutMotivation, getTechniqueTip } from '../services/geminiService';
import { ArrowLeft, Timer, CheckCircle, Info, Bot } from 'lucide-react';

interface Props {
  workout: WorkoutNode;
  user: UserProfile;
  onComplete: (xp: number, gold: number) => void;
  onExit: () => void;
}

const ActiveSession: React.FC<Props> = ({ workout, user, onComplete, onExit }) => {
  const [motivation, setMotivation] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [activeTip, setActiveTip] = useState<string | null>(null);

  useEffect(() => {
    const fetchIntro = async () => {
      setLoadingAI(true);
      const text = await getWorkoutMotivation(user, workout);
      setMotivation(text);
      setLoadingAI(false);
    };
    fetchIntro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const isFinished = completedExercises.size === workout.exercises.length;

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-4 bg-slate-900 sticky top-0 z-20">
        <button onClick={onExit} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white leading-none">{workout.title}</h2>
          <span className="text-xs text-amber-500 font-mono">Reward: {workout.xpReward} XP</span>
        </div>
      </div>

      {/* AI Oracle Message */}
      <div className="p-4 bg-violet-900/20 border-b border-violet-900/50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-violet-600 rounded-lg shrink-0">
             <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-violet-300 uppercase mb-1">Oracle Guidance</h4>
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
                  <Info className="w-3 h-3" /> Technique Tip
                </button>
                <button className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700">
                  <Timer className="w-3 h-3" /> Rest Timer
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
                  <Bot className="w-5 h-5" /> Technique Insight
               </h3>
               <p className="text-slate-200 text-sm leading-relaxed">{activeTip}</p>
               <button 
                onClick={() => setActiveTip(null)}
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm font-bold uppercase"
               >
                Got it
               </button>
            </div>
         </div>
      )}

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950 border-t border-slate-800 md:max-w-md md:mx-auto">
        <button
          disabled={!isFinished}
          onClick={() => onComplete(workout.xpReward, workout.goldReward)}
          className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${
            isFinished 
              ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isFinished ? 'Complete Quest' : `${completedExercises.size}/${workout.exercises.length} Completed`}
        </button>
      </div>
    </div>
  );
};

export default ActiveSession;