import React, { useState } from 'react';
import { UserProfile, ClassType } from '../types';
import { Shield, Zap, Brain, Trophy, ChevronRight, X, Swords, Activity, Target } from 'lucide-react';

interface Props {
  user: UserProfile;
  onUpdateClass?: (newClass: ClassType) => void;
}

const CLASS_DESCRIPTIONS = {
  [ClassType.WARRIOR]: { desc: "Masters of heavy iron. High strength potential.", bonus: "+Bonus STR gain" },
  [ClassType.SCOUT]: { desc: "Agile and enduring. Built for stamina.", bonus: "+Bonus STA gain" },
  [ClassType.MONK]: { desc: "Disciplined mind and body. Unshakable focus.", bonus: "+Bonus WILL gain" },
};

const ATTRIBUTE_INFO = {
  str: { name: "Strength (STR)", desc: "Increases physical power, lifting capacity, and heavy weapon effectiveness." },
  sta: { name: "Stamina (STA)", desc: "Boosts energy reserves, recovery speed, and cardio performance." },
  will: { name: "Willpower (WILL)", desc: "Enhances mental focus, streak protection, and resistance to fatigue." }
};

const CharacterDisplay: React.FC<Props> = ({ user, onUpdateClass }) => {
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [activeAttribute, setActiveAttribute] = useState<keyof typeof ATTRIBUTE_INFO | null>(null);

  const xpPercentage = (user.current_xp / user.max_xp) * 100;

  const handleClassSelect = (c: ClassType) => {
    if (onUpdateClass) {
      onUpdateClass(c);
    }
    setShowClassSelector(false);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl relative">
      {/* Background/Banner */}
      <div className="h-32 bg-gradient-to-r from-violet-900 to-slate-900 relative overflow-hidden group">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        {/* Class Change Button (Top Right) */}
        <div className="absolute top-2 right-2">
            <button 
              onClick={() => setShowClassSelector(true)}
              className="text-[10px] bg-black/40 hover:bg-black/60 text-white px-2 py-1 rounded border border-white/10 backdrop-blur-sm flex items-center gap-1 transition-colors uppercase font-bold tracking-wider"
            >
              Change Class <ChevronRight className="w-3 h-3" />
            </button>
        </div>

        <div className="absolute bottom-4 left-4 flex items-end space-x-4">
          <div className="w-24 h-24 rounded-full border-4 border-slate-800 bg-slate-700 overflow-hidden shadow-lg relative z-10 group-hover:scale-105 transition-transform duration-300">
             <img 
              src={`https://picsum.photos/seed/${user.username}/200/200`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mb-2">
            <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              {user.username}
              <span className="text-xs px-2 py-1 bg-amber-600 rounded text-slate-950 font-extrabold uppercase">
                Lvl {user.level}
              </span>
            </h2>
            <button 
              onClick={() => setShowClassSelector(true)}
              className="text-slate-400 text-sm font-medium hover:text-white flex items-center gap-1 transition-colors"
            >
               <span className="border-b border-dashed border-slate-500 hover:border-white">{user.class}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 pt-4 mt-2">
        {/* XP Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono uppercase">
            <span>Experience</span>
            <span>{user.current_xp} / {user.max_xp} XP</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-700">
            <div 
              className="bg-violet-500 h-full rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-500"
              style={{ width: `${xpPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Attributes (Clickable) */}
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveAttribute('str')}
            className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex flex-col items-center hover:bg-slate-800 hover:border-red-500/50 transition-all active:scale-95 group"
          >
            <Shield className="w-5 h-5 text-red-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-slate-400 uppercase tracking-wider group-hover:text-red-400">STR</span>
            <span className="text-xl font-bold text-slate-100">{user.attributes.str}</span>
          </button>
          
          <button 
            onClick={() => setActiveAttribute('sta')}
            className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex flex-col items-center hover:bg-slate-800 hover:border-green-500/50 transition-all active:scale-95 group"
          >
            <Zap className="w-5 h-5 text-green-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-slate-400 uppercase tracking-wider group-hover:text-green-400">STA</span>
            <span className="text-xl font-bold text-slate-100">{user.attributes.sta}</span>
          </button>
          
          <button 
            onClick={() => setActiveAttribute('will')}
            className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex flex-col items-center hover:bg-slate-800 hover:border-blue-500/50 transition-all active:scale-95 group"
          >
            <Brain className="w-5 h-5 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-slate-400 uppercase tracking-wider group-hover:text-blue-400">WILL</span>
            <span className="text-xl font-bold text-slate-100">{user.attributes.will}</span>
          </button>
        </div>

        {/* Real Stats */}
        <div className="mt-4 border-t border-slate-800 pt-4">
          <div className="flex items-center gap-2 mb-2 text-slate-300">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold uppercase">Personal Records</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
             <div>
                <div className="text-slate-500 text-xs">Squat</div>
                <div className="font-mono text-slate-200">{user.stats.squat_1rm}kg</div>
             </div>
             <div>
                <div className="text-slate-500 text-xs">Bench</div>
                <div className="font-mono text-slate-200">{user.stats.bench_1rm}kg</div>
             </div>
             <div>
                <div className="text-slate-500 text-xs">Deadlift</div>
                <div className="font-mono text-slate-200">{user.stats.deadlift_1rm}kg</div>
             </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Class Selector Modal */}
      {showClassSelector && (
        <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-sm p-4 flex flex-col animate-in fade-in duration-200">
           <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
             <h3 className="text-lg font-bold text-white">Select Class</h3>
             <button onClick={() => setShowClassSelector(false)}><X className="w-6 h-6 text-slate-400 hover:text-white" /></button>
           </div>
           <div className="space-y-3 overflow-y-auto">
             {Object.values(ClassType).map((c) => (
               <button 
                 key={c}
                 onClick={() => handleClassSelect(c)}
                 className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                   user.class === c 
                     ? 'bg-amber-600/20 border-amber-500 ring-1 ring-amber-500' 
                     : 'bg-slate-900 border-slate-700 hover:bg-slate-800 hover:border-slate-500'
                 }`}
               >
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/10 ${
                    c === ClassType.WARRIOR ? 'bg-red-900/50 text-red-400' :
                    c === ClassType.SCOUT ? 'bg-green-900/50 text-green-400' :
                    'bg-blue-900/50 text-blue-400'
                 }`}>
                    {c === ClassType.WARRIOR && <Swords className="w-5 h-5" />}
                    {c === ClassType.SCOUT && <Activity className="w-5 h-5" />}
                    {c === ClassType.MONK && <Target className="w-5 h-5" />}
                 </div>
                 <div>
                   <div className="font-bold text-slate-100 flex items-center gap-2">
                     {c} 
                     {user.class === c && <span className="text-[10px] bg-amber-600 text-slate-900 px-1.5 rounded font-extrabold uppercase">Current</span>}
                   </div>
                   <div className="text-xs text-slate-400 leading-tight my-0.5">{CLASS_DESCRIPTIONS[c].desc}</div>
                   <div className="text-[10px] text-amber-500 font-mono">{CLASS_DESCRIPTIONS[c].bonus}</div>
                 </div>
               </button>
             ))}
           </div>
        </div>
      )}

      {/* Attribute Info Modal */}
      {activeAttribute && (
        <div 
          className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-6 animate-in fade-in duration-200"
          onClick={() => setActiveAttribute(null)}
        >
           <div className="bg-slate-900 border border-slate-600 p-6 rounded-xl shadow-2xl w-full max-w-xs text-center transform scale-100" onClick={e => e.stopPropagation()}>
              <div className="mb-4 inline-flex p-3 rounded-full bg-slate-800 border border-slate-700">
                {activeAttribute === 'str' && <Shield className="w-8 h-8 text-red-500" />}
                {activeAttribute === 'sta' && <Zap className="w-8 h-8 text-green-500" />}
                {activeAttribute === 'will' && <Brain className="w-8 h-8 text-blue-500" />}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{ATTRIBUTE_INFO[activeAttribute].name}</h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">{ATTRIBUTE_INFO[activeAttribute].desc}</p>
              <button 
                onClick={() => setActiveAttribute(null)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold border border-slate-700 text-slate-200 transition-colors"
              >
                Close
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default CharacterDisplay;