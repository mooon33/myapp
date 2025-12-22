import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile, WorkoutNode, Guild, ShopItem, ClassType, AppSettings, Stats, InventoryItem } from './types';
import { MOCK_USER, CAMPAIGN_MAP, MOCK_INVENTORY, MOCK_GUILDS, MOCK_SHOP_ITEMS, TRANSLATIONS } from './constants';
import CharacterDisplay from './components/CharacterDisplay';
import WorkoutMap from './components/WorkoutMap';
import ActiveSession from './components/ActiveSession';
import Inventory from './components/Inventory';
import GuildsView from './components/GuildsView';
import ShopView from './components/ShopView';
import SettingsView from './components/SettingsView';
import EvolutionView from './components/EvolutionView';
import AuthView from './components/AuthView';
import OnboardingView from './components/OnboardingView';
import { Map, User as UserIcon, Users, Settings, ShoppingBag, ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';

type ViewState = 'onboarding' | 'map' | 'profile' | 'guild' | 'workout' | 'shop' | 'settings' | 'evolution';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<ViewState>('map');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeNode, setActiveNode] = useState<WorkoutNode | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>(MOCK_GUILDS);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [userInventory, setUserInventory] = useState(MOCK_INVENTORY);
  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    notificationsEnabled: true,
    language: 'ru', // Default to Russian
  });
  
  const [notification, setNotification] = useState<string | null>(null);
  const t = TRANSLATIONS[settings.language];

  // --- Auth & Data Loading ---

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        const userProfile: UserProfile = {
           id: data.id,
           username: data.username || authUser.email?.split('@')[0] || 'Hero',
           class: data.class as ClassType,
           level: data.level,
           current_xp: data.current_xp,
           max_xp: data.max_xp,
           gold: data.gold,
           attributes: data.attributes,
           stats: data.stats,
           streak: data.streak,
           guildId: data.guild_id,
           gender: data.gender,
           height: data.height,
           weight: data.weight
        };
        setUser(userProfile);

        if (!userProfile.height || !userProfile.weight || userProfile.height === 0) {
            setView('onboarding');
        } else {
            setView('map');
        }

      } else {
        await createNewProfile(authUser);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewProfile = async (authUser: User) => {
    const username = authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'Novice';

    const newProfile = {
      id: authUser.id,
      username: username,
      class: ClassType.WARRIOR,
      level: 1,
      current_xp: 0,
      max_xp: 1000,
      gold: 100,
      attributes: { str: 10, sta: 10, will: 10 },
      stats: { squat_1rm: 0, bench_1rm: 0, deadlift_1rm: 0 },
      streak: 0,
      height: 0,
      weight: 0,
    };

    const { error } = await supabase.from('profiles').insert([newProfile]);
    
    if (!error) {
      setUser({ ...newProfile, guildId: null });
      setView('onboarding');
    } else {
      console.error('Error creating profile:', error);
      setUser({ ...MOCK_USER, id: authUser.id, username: username }); 
      setView('map');
    }
    setIsLoading(false);
  };

  const handleCompleteOnboarding = async (data: { gender: 'male' | 'female' | 'other'; height: number; weight: number; class: ClassType }) => {
    if (!user) return;
    setIsLoading(true);

    const updatedProfile = {
        ...user,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        class: data.class
    };

    setUser(updatedProfile);

    const { error } = await supabase.from('profiles').update({
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        class: data.class
    }).eq('id', user.id);

    if (error) {
        console.error("Error saving profile:", error);
        triggerNotification("Error saving profile details");
    } else {
        triggerNotification("Character Created Successfully!");
        setView('map');
    }
    setIsLoading(false);
  };

  const triggerNotification = (msg: string, duration = 2000) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), duration);
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    triggerNotification("Logged out successfully");
  };

  const handleUpdateClass = async (newClass: ClassType) => {
    if (!user) return;
    setUser(prev => prev ? ({ ...prev, class: newClass }) : null);
    const { error } = await supabase.from('profiles').update({ class: newClass }).eq('id', user.id);
    if (error) {
       triggerNotification("Failed to save class change");
    } else {
       triggerNotification(`Class changed to ${newClass}!`);
    }
  };

  const handleUpdateStats = async (newStats: Stats) => {
    if (!user) return;
    setUser(prev => prev ? ({ ...prev, stats: newStats }) : null);
    const { error } = await supabase.from('profiles').update({ stats: newStats }).eq('id', user.id);
    if (error) {
      triggerNotification("Failed to save stats");
    } else {
      triggerNotification(t.updateRecords + "!");
    }
  };

  const handleNodeClick = (node: WorkoutNode) => {
    setActiveNode(node);
    setView('workout');
  };

  const handleWorkoutComplete = async (xp: number, gold: number) => {
    if (!user) return;

    const newXp = user.current_xp + xp;
    const leveledUp = newXp >= user.max_xp;
    
    const updatedUser = {
      ...user,
      current_xp: leveledUp ? newXp - user.max_xp : newXp,
      level: leveledUp ? user.level + 1 : user.level,
      max_xp: leveledUp ? Math.floor(user.max_xp * 1.2) : user.max_xp,
      gold: user.gold + gold,
      streak: user.streak + 1
    };

    setUser(updatedUser);

    // Only notify on Level Up. 
    // The "Quest Complete" notification is removed because the Victory Screen already displays rewards.
    if (leveledUp) {
       triggerNotification(`${t.levelUp} ${t.lvl} ${updatedUser.level}`, 5000);
    }

    setView('map');
    setActiveNode(null);

    await supabase.from('profiles').update({
       current_xp: updatedUser.current_xp,
       level: updatedUser.level,
       max_xp: updatedUser.max_xp,
       gold: updatedUser.gold,
       streak: updatedUser.streak
    }).eq('id', user.id);
  };

  const handleExitWorkout = () => {
    setView('map');
    setActiveNode(null);
  };

  const handleJoinGuild = (guildId: string) => {
    if (!user) return;
    const targetGuild = guilds.find(g => g.id === guildId);
    if (targetGuild && targetGuild.members >= targetGuild.maxMembers) {
      triggerNotification(t.full + "!");
      return;
    }
    setUser(prev => prev ? ({ ...prev, guildId }) : null);
    setGuilds(prev => prev.map(g => {
      if (g.id === guildId) return { ...g, members: g.members + 1 };
      return g;
    }));
    triggerNotification(t.completed + "!");
    supabase.from('profiles').update({ guild_id: guildId }).eq('id', user.id);
  };

  const handleLeaveGuild = () => {
    if (!user || !user.guildId) return;
    setGuilds(prev => prev.map(g => {
      if (g.id === user.guildId) return { ...g, members: Math.max(0, g.members - 1) };
      return g;
    }));
    setUser(prev => prev ? ({ ...prev, guildId: null }) : null);
    triggerNotification(t.completed + ".");
    supabase.from('profiles').update({ guild_id: null }).eq('id', user.id);
  };

  const handleCreateGuild = (data: { name: string; description: string; icon: Guild['icon'] }) => {
    if (!user) return;
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
    setUser(prev => prev ? ({ ...prev, guildId: newGuildId }) : null);
    triggerNotification(`${t.guild} "${data.name}" !`);
  };

  const handleBuyItem = (item: ShopItem) => {
    if (!user) return;
    if (user.gold < item.price) {
      triggerNotification(t.notEnoughGold);
      return;
    }

    const newGold = user.gold - item.price;
    setUser(prev => prev ? ({ ...prev, gold: newGold }) : null);
    
    const newItem = {
      ...item,
      id: `i-${Date.now()}`,
      is_equipped: false,
    };
    
    setUserInventory(prev => [...prev, newItem]);
    triggerNotification(`${t.purchased} ${item.name}!`);

    supabase.from('profiles').update({ gold: newGold }).eq('id', user.id);
  };

  const handleToggleEquip = (item: InventoryItem) => {
    setUserInventory(prev => {
        const isEquipping = !item.is_equipped;
        return prev.map(i => {
            // Toggle the specific item
            if (i.id === item.id) {
                return { ...i, is_equipped: isEquipping };
            }
            // If we are equipping a new item, ensure other items of the same type are unequipped
            // We assume 'consumable' doesn't get equipped in the slot sense, but we'll stick to types.
            if (isEquipping && i.type === item.type && i.is_equipped && i.type !== 'consumable') {
                return { ...i, is_equipped: false };
            }
            return i;
        });
    });
    const action = !item.is_equipped ? t.equip : t.unequip; // status before toggle
    triggerNotification(`${action} ${item.name}`);
  };

  // Simulates starting a shared workout with a friend
  const handleStartSharedWorkout = (friendName: string) => {
      triggerNotification(`${t.startingWorkout} ${friendName}`);
      // Simulate finding a workout to start
      const firstWorkout = CAMPAIGN_MAP.find(w => w.status === 'available' || w.status === 'completed');
      if (firstWorkout) {
          setTimeout(() => {
            handleNodeClick(firstWorkout);
          }, 1000);
      }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
        <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">{t.loading}</p>
      </div>
    );
  }

  if (!session || !user) {
    return (
        <AuthView 
            currentLang={settings.language} 
            onToggleLang={(l) => handleUpdateSettings({ language: l })} 
        />
    );
  }

  if (view === 'onboarding') {
    return <OnboardingView user={user} lang={settings.language} onComplete={handleCompleteOnboarding} />;
  }

  const currentNodes = CAMPAIGN_MAP.filter(n => n.chapter === currentChapter);
  const maxChapters = Math.max(...CAMPAIGN_MAP.map(n => n.chapter || 1));
  const xpPercentage = Math.min(100, (user.current_xp / user.max_xp) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex justify-center">
      <div className="w-full max-w-md bg-slate-950 min-h-screen shadow-2xl relative flex flex-col">
        
        {view === 'workout' && activeNode ? (
          <ActiveSession 
            workout={activeNode} 
            user={user} 
            lang={settings.language}
            onComplete={handleWorkoutComplete}
            onExit={handleExitWorkout}
          />
        ) : (
          <>
            {/* Top Bar */}
            <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800 p-2 flex justify-between items-center gap-3 shadow-lg">
               {/* Level & XP */}
               <div className="flex items-center gap-3 flex-1 bg-slate-900/80 border-slate-800 p-1.5 pr-4 rounded-full border">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center font-black text-slate-900 border-2 border-slate-900 shrink-0 shadow-lg text-lg">
                    {user.level}
                 </div>
                 <div className="flex flex-col flex-1 gap-0.5">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                       <span>{t.xp}</span>
                       <span>{Math.floor(xpPercentage)}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                       <div className="h-full bg-violet-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" style={{ width: `${xpPercentage}%` }}></div>
                    </div>
                 </div>
               </div>
               
               {/* Gold & Settings */}
               <div className="flex items-center gap-2">
                  <div className="bg-slate-900 border-slate-800 px-3 py-1.5 rounded-full border flex items-center gap-2 shadow-inner">
                     <span className="text-amber-400 font-mono font-bold text-lg drop-shadow-sm">{user.gold}</span>
                     <span className="text-xl filter drop-shadow">🪙</span>
                  </div>

                  <button 
                    onClick={() => setView('settings')}
                    className={`p-2 rounded-full transition-colors ${view === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Settings className="w-6 h-6" />
                  </button>
               </div>
            </div>

            {notification && (
              <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-bounce text-center max-w-[90%] w-auto break-words border-2 border-amber-300">
                {notification}
              </div>
            )}

            <div className="flex-1 overflow-y-auto pb-24 bg-slate-950">
              {view === 'map' && (
                <div className="p-4">
                  <CharacterDisplay user={user} lang={settings.language} onUpdateClass={handleUpdateClass} onUpdateStats={handleUpdateStats} />
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <button 
                        onClick={() => setCurrentChapter(prev => Math.max(1, prev - 1))}
                        disabled={currentChapter === 1}
                        className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronLeft className="w-6 h-6 text-slate-400" />
                      </button>
                      
                      <div className="text-center">
                        <h3 className="text-slate-400 uppercase tracking-widest text-xs font-bold">{t.campaign}</h3>
                        <h2 className="text-xl font-bold text-white">{t.chapter} {currentChapter}</h2>
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
                    <h2 className="text-2xl font-bold mb-4 text-white">{t.hero}</h2>
                    <CharacterDisplay user={user} lang={settings.language} onUpdateClass={handleUpdateClass} onUpdateStats={handleUpdateStats} />
                    <div className="mt-6">
                       <Inventory items={userInventory} lang={settings.language} onToggleEquip={handleToggleEquip} />
                    </div>
                 </div>
              )}
              
              {view === 'guild' && (
                 <GuildsView 
                    guilds={guilds}
                    userGuildId={user.guildId}
                    username={user.username}
                    lang={settings.language}
                    onJoinGuild={handleJoinGuild}
                    onLeaveGuild={handleLeaveGuild}
                    onCreateGuild={handleCreateGuild}
                    onStartSharedWorkout={handleStartSharedWorkout}
                 />
              )}

              {view === 'shop' && (
                <ShopView 
                  items={MOCK_SHOP_ITEMS} 
                  userGold={user.gold} 
                  userLevel={user.level}
                  lang={settings.language}
                  onBuy={handleBuyItem} 
                />
              )}

              {view === 'evolution' && (
                <EvolutionView user={user} lang={settings.language} />
              )}

              {view === 'settings' && (
                <SettingsView 
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onLogout={handleLogout}
                />
              )}
            </div>

            <div className="fixed bottom-0 w-full max-w-md bg-slate-900 border-slate-800 border-t p-2 pb-4 flex justify-between px-2 items-center z-40">
              <button 
                onClick={() => setView('map')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 transition-colors ${view === 'map' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Map className="w-6 h-6" />
                <span className="text-[9px] uppercase font-bold">{t.map}</span>
              </button>
              
              <button 
                onClick={() => setView('guild')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 transition-colors ${view === 'guild' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Users className="w-6 h-6" />
                <span className="text-[9px] uppercase font-bold">{t.social}</span>
              </button>

              <button 
                onClick={() => setView('evolution')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 transition-colors ${view === 'evolution' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Sparkles className="w-6 h-6" />
                <span className="text-[9px] uppercase font-bold">{t.evolve}</span>
              </button>

              <button 
                onClick={() => setView('shop')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 transition-colors ${view === 'shop' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <ShoppingBag className="w-6 h-6" />
                <span className="text-[9px] uppercase font-bold">{t.shop}</span>
              </button>

              <button 
                 onClick={() => setView('profile')}
                 className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 transition-colors ${view === 'profile' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <UserIcon className="w-6 h-6" />
                <span className="text-[9px] uppercase font-bold">{t.hero}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;