import React, { useState } from 'react';
import { UserProfile, WorkoutNode, Guild, ShopItem, ClassType, AppSettings, Stats } from './types';
import { MOCK_USER, CAMPAIGN_MAP, MOCK_INVENTORY, MOCK_GUILDS, MOCK_SHOP_ITEMS } from './constants';
import CharacterDisplay from './components/CharacterDisplay';
import WorkoutMap from './components/WorkoutMap';
import ActiveSession from './components/ActiveSession';
import Inventory from './components/Inventory';
import GuildsView from './components/GuildsView';
import ShopView from './components/ShopView';
import SettingsView from './components/SettingsView';
import EvolutionView from './components/EvolutionView';
import { Map, User as UserIcon, Users, Settings, ShoppingBag, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

// Using a simple View state instead of Router for this demo
type ViewState = 'map' | 'profile' | 'guild' | 'workout' | 'shop' | 'settings' | 'evolution';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('map');
  const [user, setUser] = useState<UserProfile>(MOCK_USER);
  const [activeNode, setActiveNode] = useState<WorkoutNode | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>(MOCK_GUILDS);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [userInventory, setUserInventory] = useState(MOCK_INVENTORY);
  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    notificationsEnabled: true,
    language: 'en',
    theme: 'dark'
  });
  
  // Confetti/Level up state (simplified for demo)
  const [notification, setNotification] = useState<string | null>(null);

  // Helper to handle notifications
  const triggerNotification = (msg: string, duration = 2000) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), duration);
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleLogout = () => {
    triggerNotification("Logged out successfully");
  };

  const handleUpdateClass = (newClass: ClassType) => {
    setUser(prev => ({ ...prev, class: newClass }));
    triggerNotification(`Class changed to ${newClass}!`);
  };

  const handleUpdateStats = (newStats: Stats) => {
    setUser(prev => ({ ...prev, stats: newStats }));
    triggerNotification("Personal Records Updated!");
  };

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
         triggerNotification(`LEVEL UP! You are now level ${prev.level + 1}`, 5000);
      } else {
         triggerNotification(`Quest Complete! +${xp} XP, +${gold} Gold`, 3000);
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

  const handleJoinGuild = (guildId: string) => {
    const targetGuild = guilds.find(g => g.id === guildId);
    if (targetGuild && targetGuild.members >= targetGuild.maxMembers) {
      triggerNotification("Guild is full!");
      return;
    }
    setUser(prev => ({ ...prev, guildId }));
    setGuilds(prev => prev.map(g => {
      if (g.id === guildId) return { ...g, members: g.members + 1 };
      return g;
    }));
    triggerNotification("Joined Guild Successfully!");
  };

  const handleLeaveGuild = () => {
    if (!user.guildId) return;
    setGuilds(prev => prev.map(g => {
      if (g.id === user.guildId) return { ...g, members: Math.max(0, g.members - 1) };
      return g;
    }));
    setUser(prev => ({ ...prev, guildId: null }));
    triggerNotification("Left Guild.");
  };

  const handleCreateGuild = (data: { name: string; description: string; icon: Guild['icon'] }) => {
    const newGuildId = `g-${Date.now()}`;
    const newGuild: Guild = {
      id: newGuildId,
      name: data.name,
      description: data.description,
      icon: data.icon,
      members: 1,
      maxMembers: 30,
      totalXp: 0,
      rank: guilds.length + 1,
    };
    setGuilds(prev => [...prev, newGuild]);
    setUser(prev => ({ ...prev, guildId: newGuildId }));
    triggerNotification(`Guild "${data.name}" Created!`);
  };

  const handleBuyItem = (item: ShopItem) => {
    if (user.gold < item.price) {
      triggerNotification("Not enough gold!");
      return;
    }

    setUser(prev => ({ ...prev, gold: prev.gold - item.price }));
    
    // Add to inventory
    const newItem = {
      ...item,
      id: `i-${Date.now()}`, // unique ID for inventory instance
      is_equipped: false,
    };
    
    setUserInventory(prev => [...prev, newItem]);
    triggerNotification(`Purchased ${item.name}!`);
  };

  // Filter nodes for current chapter
  const currentNodes = CAMPAIGN_MAP.filter(n => n.chapter === currentChapter);
  const maxChapters = Math.max(...CAMPAIGN_MAP.map(n => n.chapter || 1));
  const xpPercentage = Math.min(100, (user.current_xp / user.max_xp) * 100);

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
            {/* Top Bar (Sticky) - UPDATED DESIGN */}
            <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800 p-2 flex justify-between items-center gap-3 shadow-lg">
               {/* Left: Level & XP */}
               <div className="flex items-center gap-3 flex-1 bg-slate-900/80 p-1.5 pr-4 rounded-full border border-slate-800">
                 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center font-black text-slate-900 border-2 border-slate-900 shrink-0 shadow-lg">
                    {user.level}
                 </div>
                 <div className="flex flex-col flex-1 gap-0.5">
                    <div className="flex justify-between text-[9px] uppercase font-bold text-slate-400">
                       <span>XP</span>
                       <span>{Math.floor(xpPercentage)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                       <div className="h-full bg-violet-500 rounded-full" style={{ width: `${xpPercentage}%` }}></div>
                    </div>
                 </div>
               </div>
               
               {/* Right: Gold & Settings */}
               <div className="flex items-center gap-2">
                  <div className="bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 flex items-center gap-1.5">
                     <span className="text-amber-400 font-mono font-bold text-sm">{user.gold}</span>
                     <span className="text-lg">🪙</span>
                  </div>

                  <button 
                    onClick={() => setView('settings')}
                    className={`p-2 rounded-full transition-colors ${view === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Settings className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {/* Notification Toast */}
            {notification && (
              <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-bounce text-center max-w-[90%] w-auto break-words border-2 border-amber-300">
                {notification}
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto pb-24 bg-slate-950">
              {view === 'map' && (
                <div className="p-4">
                  <CharacterDisplay user={user} onUpdateClass={handleUpdateClass} onUpdateStats={handleUpdateStats} />
                  
                  <div className="mt-6">
                    {/* Chapter Header & Controls */}
                    <div className="flex items-center justify-between mb-4 px-2">
                      <button 
                        onClick={() => setCurrentChapter(prev => Math.max(1, prev - 1))}
                        disabled={currentChapter === 1}
                        className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronLeft className="w-6 h-6 text-slate-400" />
                      </button>
                      
                      <div className="text-center">
                        <h3 className="text-slate-400 uppercase tracking-widest text-xs font-bold">Campaign Map</h3>
                        <h2 className="text-xl font-bold text-white">Chapter {currentChapter}</h2>
                      </div>

                      <button 
                        onClick={() => setCurrentChapter(prev => Math.min(maxChapters, prev + 1))}
                        disabled={currentChapter === maxChapters}
                        className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronRight className="w-6 h-6 text-slate-400" />
                      </button>
                    </div>

                    <WorkoutMap nodes={currentNodes} onNodeClick={handleNodeClick} />
                  </div>
                </div>
              )}

              {view === 'profile' && (
                 <div className="p-4">
                    <h2 className="text-2xl font-bold mb-4">Hero Profile</h2>
                    <CharacterDisplay user={user} onUpdateClass={handleUpdateClass} onUpdateStats={handleUpdateStats} />
                    <div className="mt-6">
                       <Inventory items={userInventory} />
                    </div>
                 </div>
              )}
              
              {view === 'guild' && (
                 <GuildsView 
                    guilds={guilds}
                    userGuildId={user.guildId}
                    username={user.username}
                    onJoinGuild={handleJoinGuild}
                    onLeaveGuild={handleLeaveGuild}
                    onCreateGuild={handleCreateGuild}
                 />
              )}

              {view === 'shop' && (
                <ShopView 
                  items={MOCK_SHOP_ITEMS} 
                  userGold={user.gold} 
                  userLevel={user.level}
                  onBuy={handleBuyItem} 
                />
              )}

              {view === 'evolution' && (
                <EvolutionView user={user} />
              )}

              {view === 'settings' && (
                <SettingsView 
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onLogout={handleLogout}
                />
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 w-full max-w-md bg-slate-900 border-t border-slate-800 p-2 pb-4 flex justify-between px-2 items-center z-40">
              <button 
                onClick={() => setView('map')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 transition-colors ${view === 'map' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Map className="w-6 h-6" />
                <span className="text-[9px] uppercase font-bold">Map</span>
              </button>
              
              <button 
                onClick={() => setView('guild')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 transition-colors ${view === 'guild' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Users className="w-6 h-6" />
                <span className="text-[9px] uppercase font-bold">Social</span>
              </button>

              <button 
                onClick={() => setView('evolution')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 transition-colors ${view === 'evolution' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Sparkles className="w-6 h-6" />
                <span className="text-[9px] uppercase font-bold">Evolve</span>
              </button>

              <button 
                onClick={() => setView('shop')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 transition-colors ${view === 'shop' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <ShoppingBag className="w-6 h-6" />
                <span className="text-[9px] uppercase font-bold">Shop</span>
              </button>

              <button 
                 onClick={() => setView('profile')}
                 className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 transition-colors ${view === 'profile' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <UserIcon className="w-6 h-6" />
                <span className="text-[9px] uppercase font-bold">Hero</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;