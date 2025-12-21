import React, { useState } from 'react';
import { UserProfile, WorkoutNode } from './types';
import { MOCK_USER, CAMPAIGN_MAP, MOCK_INVENTORY } from './constants';
import CharacterDisplay from './components/CharacterDisplay';
import WorkoutMap from './components/WorkoutMap';
import ActiveSession from './components/ActiveSession';
import Inventory from './components/Inventory';
import { Map, User as UserIcon, Users, Dumbbell } from 'lucide-react';

// Using a simple View state instead of Router for this demo
type ViewState = 'map' | 'profile' | 'guild' | 'workout';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('map');
  const [user, setUser] = useState<UserProfile>(MOCK_USER);
  const [activeNode, setActiveNode] = useState<WorkoutNode | null>(null);
  
  // Confetti/Level up state (simplified for demo)
  const [notification, setNotification] = useState<string | null>(null);

  const handleNodeClick = (node: WorkoutNode) => {
    setActiveNode(node);
    setView('workout');
  };

  const handleWorkoutComplete = (xp: number, gold: number) => {
    // Update local state (mocking DB update)
    setUser(prev => {
      const newXp = prev.current_xp + xp;
      const leveledUp = newXp >= prev.max_xp;
      
      if (leveledUp) {
         setNotification(`LEVEL UP! You are now level ${prev.level + 1}`);
         setTimeout(() => setNotification(null), 5000);
      } else {
         setNotification(`Quest Complete! +${xp} XP, +${gold} Gold`);
         setTimeout(() => setNotification(null), 3000);
      }

      return {
        ...prev,
        current_xp: leveledUp ? newXp - prev.max_xp : newXp,
        level: leveledUp ? prev.level + 1 : prev.level,
        max_xp: leveledUp ? Math.floor(prev.max_xp * 1.2) : prev.max_xp,
        gold: prev.gold + gold,
        streak: prev.streak + 1
      };
    });

    setView('map');
    setActiveNode(null);
  };

  const handleExitWorkout = () => {
    setView('map');
    setActiveNode(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex justify-center">
      {/* Mobile-first container */}
      <div className="w-full max-w-md bg-slate-950 min-h-screen shadow-2xl relative flex flex-col">
        
        {/* Render View */}
        {view === 'workout' && activeNode ? (
          <ActiveSession 
            workout={activeNode} 
            user={user} 
            onComplete={handleWorkoutComplete}
            onExit={handleExitWorkout}
          />
        ) : (
          <>
            {/* Top Bar (Sticky) */}
            <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800 p-3 flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded bg-amber-600 flex items-center justify-center font-bold text-slate-900">
                    {user.level}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Gold</span>
                    <span className="text-sm font-mono text-amber-400">{user.gold} 🪙</span>
                 </div>
               </div>
               <div className="text-xs font-bold text-orange-500 animate-pulse">
                 🔥 {user.streak} Day Streak
               </div>
            </div>

            {/* Notification Toast */}
            {notification && (
              <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-bounce">
                {notification}
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto pb-24">
              {view === 'map' && (
                <div className="p-4">
                  <CharacterDisplay user={user} />
                  <div className="mt-6">
                    <h3 className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-4 text-center">Campaign Map</h3>
                    <WorkoutMap nodes={CAMPAIGN_MAP} onNodeClick={handleNodeClick} />
                  </div>
                </div>
              )}

              {view === 'profile' && (
                 <div className="p-4">
                    <h2 className="text-2xl font-bold mb-4">Hero Profile</h2>
                    <CharacterDisplay user={user} />
                    <div className="mt-6">
                       <Inventory items={MOCK_INVENTORY} />
                    </div>
                 </div>
              )}
              
              {view === 'guild' && (
                 <div className="p-4 flex flex-col items-center justify-center h-64 text-slate-500 text-center">
                    <Users className="w-16 h-16 mb-4 opacity-50" />
                    <h2 className="text-xl font-bold mb-2">Guild Hall</h2>
                    <p className="text-sm">Join a guild to compete on leaderboards and defeat raid bosses together.</p>
                    <button className="mt-4 px-6 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
                       Coming Soon
                    </button>
                 </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 w-full max-w-md bg-slate-900 border-t border-slate-800 p-2 pb-4 flex justify-around items-center z-40">
              <button 
                onClick={() => setView('map')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg w-16 transition-colors ${view === 'map' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Map className="w-6 h-6" />
                <span className="text-[10px] uppercase font-bold">Map</span>
              </button>
              
              <button 
                onClick={() => setView('workout')} // Just opens map context mostly, but could be quick start
                className="flex flex-col items-center gap-1 p-2 -mt-8"
              >
                <div className="w-14 h-14 rounded-full bg-violet-600 border-4 border-slate-900 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] text-white">
                  <Dumbbell className="w-7 h-7" />
                </div>
              </button>

              <button 
                 onClick={() => setView('profile')}
                 className={`flex flex-col items-center gap-1 p-2 rounded-lg w-16 transition-colors ${view === 'profile' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <UserIcon className="w-6 h-6" />
                <span className="text-[10px] uppercase font-bold">Hero</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;