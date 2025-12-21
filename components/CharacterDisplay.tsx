import React from 'react';
import { UserProfile, ClassType } from '../types';
import { Shield, Zap, Brain, Trophy } from 'lucide-react';

interface Props {
  user: UserProfile;
}

const CharacterDisplay: React.FC<Props> = ({ user }) => {
  const xpPercentage = (user.current_xp / user.max_xp) * 100;

  return (
    <div className="w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl relative">
      {/* Background/Banner */}
      <div className="h-32 bg-gradient-to-r from-violet-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute bottom-4 left-4 flex items-end space-x-4">
          <div className="w-24 h-24 rounded-full border-4 border-slate-800 bg-slate-700 overflow-hidden shadow-lg relative z-10">
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
            <p className="text-slate-400 text-sm font-medium">{user.class}</p>
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

        {/* Attributes */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex flex-col items-center">
            <Shield className="w-5 h-5 text-red-500 mb-1" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">STR</span>
            <span className="text-xl font-bold text-slate-100">{user.attributes.str}</span>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex flex-col items-center">
            <Zap className="w-5 h-5 text-green-500 mb-1" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">STA</span>
            <span className="text-xl font-bold text-slate-100">{user.attributes.sta}</span>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex flex-col items-center">
            <Brain className="w-5 h-5 text-blue-500 mb-1" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">WILL</span>
            <span className="text-xl font-bold text-slate-100">{user.attributes.will}</span>
          </div>
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
    </div>
  );
};

export default CharacterDisplay;