import React from 'react';
import { UserProfile } from '../types';
import { SPRITE_EVOLUTION } from '../constants';
import { Sparkles, Lock, ArrowDown } from 'lucide-react';

interface Props {
  user: UserProfile;
}

const EvolutionView: React.FC<Props> = ({ user }) => {
  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" /> Evolution Path
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
         <p className="text-center text-slate-400 text-sm mb-8">
            Your journey from novice to legend. Train hard to unlock new forms.
         </p>

         <div className="relative border-l-2 border-slate-800 ml-4 space-y-8 pb-10">
            {SPRITE_EVOLUTION.map((milestone, index) => {
               const isUnlocked = user.level >= milestone.level;
               const isNext = !isUnlocked && (index === 0 || user.level >= SPRITE_EVOLUTION[index-1].level);
               
               return (
                  <div key={milestone.level} className="relative pl-8">
                     {/* Timeline Dot */}
                     <div className={`absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-colors ${
                        isUnlocked ? 'bg-purple-500 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 
                        isNext ? 'bg-slate-900 border-amber-500 animate-pulse' :
                        'bg-slate-900 border-slate-700'
                     }`}></div>

                     {/* Content Card */}
                     <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all w-64 ${
                        isUnlocked 
                           ? 'bg-gradient-to-br from-purple-900/20 to-slate-900 border-purple-500/50 shadow-lg' 
                           : 'bg-slate-900 border-slate-800 opacity-60'
                     }`}>
                        <div className="w-16 h-16 rounded-lg bg-slate-950 border border-slate-700 overflow-hidden relative shrink-0">
                           <img 
                              src={milestone.imageUrl} 
                              alt={milestone.title} 
                              className={`w-full h-full object-cover ${!isUnlocked && 'grayscale blur-[1px]'}`} 
                           />
                           {!isUnlocked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                 <Lock className="w-6 h-6 text-slate-400" />
                              </div>
                           )}
                        </div>
                        
                        <div>
                           <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                              {isUnlocked ? (
                                 <span className="text-purple-400">Unlocked</span>
                              ) : (
                                 <span className="text-slate-500">Requires Lvl {milestone.level}</span>
                              )}
                           </div>
                           <h3 className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>{milestone.title}</h3>
                           {isNext && (
                              <div className="text-[10px] text-amber-500 mt-1 font-mono">
                                 Next Milestone
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>

         {/* Arrow indicating more to come */}
         <div className="flex flex-col items-center text-slate-600 mt-4">
            <ArrowDown className="w-5 h-5 animate-bounce" />
            <span className="text-xs uppercase font-bold tracking-widest mt-2">More coming soon</span>
         </div>
      </div>
    </div>
  );
};

export default EvolutionView;