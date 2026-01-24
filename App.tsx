
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile, WorkoutNode, Guild, ShopItem, ClassType, AppSettings, Stats, InventoryItem, TrainingPath, WorkoutInvite, Difficulty, Exercise } from './types';
import { MOCK_USER, CAMPAIGN_DATA, MOCK_INVENTORY, MOCK_GUILDS, MOCK_SHOP_ITEMS, TRANSLATIONS } from './constants';
import { generateCustomWorkout } from './services/geminiService';
import CharacterDisplay from './components/CharacterDisplay';
import WorkoutMap from './components/WorkoutMap';
import ActiveSession from './components/ActiveSession';
import Inventory from './components/Inventory';
import GuildsView from './components/GuildsView';
import ShopView from './components/ShopView';
import SettingsView from './components/SettingsView';
import AvatarView from './components/AvatarView'; 
import AuthView from './components/AuthView';
import OnboardingView from './components/OnboardingView';
import HistoryView from './components/HistoryView';
import { Map, User as UserIcon, Users, Settings, ShoppingBag, Sparkles, Loader2, Dumbbell, Weight as WeightIcon, Brain, Scroll, Send } from 'lucide-react';

type ViewState = 'onboarding' | 'map' | 'profile' | 'guild' | 'workout' | 'shop' | 'settings' | 'avatar' | 'history';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<ViewState>('map');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeNode, setActiveNode] = useState<WorkoutNode | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [userInventory, setUserInventory] = useState(MOCK_INVENTORY);
  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    notificationsEnabled: true,
    language: 'ru', // Default to Russian
  });
  
  // Custom Workout State
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [notification, setNotification] = useState<string | null>(null);
  const [incomingInvite, setIncomingInvite] = useState<WorkoutInvite | null>(null);
  const [partnerMode, setPartnerMode] = useState<string | null>(null); 

  const t = TRANSLATIONS[settings.language];

  // --- Auth & Data Loading ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        Promise.all([fetchUserProfile(session.user), fetchGuilds()]).then(() => setIsLoading(false));
        listenForInvites(session.user.id);
        listenForAcceptedInvites(session.user.id); // NEW: Listen for invites I sent
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        fetchUserProfile(session.user);
        fetchGuilds();
        listenForInvites(session.user.id);
        listenForAcceptedInvites(session.user.id); // NEW
      } else if (!session) {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Realtime Guilds Listener
    const guildChannel = supabase.channel('public:guilds')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guilds' }, (payload) => {
            const newGuildRaw = payload.new as any;
            const newGuild: Guild = {
                id: newGuildRaw.id,
                name: newGuildRaw.name,
                description: newGuildRaw.description,
                icon: newGuildRaw.icon,
                members: newGuildRaw.members || 1,
                maxMembers: newGuildRaw.max_members || 50,
                totalXp: newGuildRaw.total_xp || 0,
                rank: newGuildRaw.rank || 999
            };
            setGuilds(prev => {
                // Prevent duplicates
                if (prev.find(g => g.id === newGuild.id)) return prev;
                return [...prev, newGuild];
            });
        })
        .subscribe();

    return () => {
        subscription.unsubscribe();
        supabase.removeChannel(guildChannel);
    };
  }, []);

  const fetchGuilds = async () => {
    try {
      const { data, error } = await supabase.from('guilds').select('*').order('total_xp', { ascending: false });
      
      if (error) {
          console.error("Error fetching guilds:", error);
          // Only fall back to mock if there is an actual error, not just empty data
          if (guilds.length === 0) setGuilds(MOCK_GUILDS);
          return;
      }
      
      if (data) {
        setGuilds(data.map(g => ({ ...g, maxMembers: g.max_members, totalXp: g.total_xp })));
      }
    } catch (e) { 
        if (guilds.length === 0) setGuilds(MOCK_GUILDS); 
    }
  };

  // Listen for invites SENT TO ME
  const listenForInvites = (userId: string) => {
      const channel = supabase.channel('public:workout_invites_received')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'workout_invites', filter: `receiver_id=eq.${userId}` }, (payload) => {
            setIncomingInvite({ id: payload.new.id, senderId: payload.new.sender_id, senderName: 'Partner', workoutId: payload.new.workout_id, status: 'pending' });
            triggerNotification(t.friendRequestReceived || "New Workout Invite!");
        }).subscribe();
      return () => { supabase.removeChannel(channel); };
  };

  // NEW: Listen for invites I SENT that get ACCEPTED
  const listenForAcceptedInvites = (userId: string) => {
      const channel = supabase.channel('public:workout_invites_sent')
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'workout_invites', 
            filter: `sender_id=eq.${userId}` 
        }, async (payload) => {
            const updatedInvite = payload.new;
            if (updatedInvite.status === 'accepted') {
                // Find the workout node to start
                let foundNode: WorkoutNode | null = null;
                // Search in all campaign paths
                Object.values(CAMPAIGN_DATA).forEach(path => {
                    const node = path.find(n => n.id === updatedInvite.workout_id);
                    if (node) foundNode = node;
                });

                if (foundNode) {
                    // Try to get receiver username for display
                    let partnerName = 'Partner';
                    const { data } = await supabase.from('profiles').select('username').eq('id', updatedInvite.receiver_id).single();
                    if (data) partnerName = data.username;

                    triggerNotification(`${t.startingWorkout} (${partnerName})`);
                    setPartnerMode(partnerName);
                    setActiveNode(foundNode);
                    setView('workout');
                }
            }
        }).subscribe();
      
      return () => { supabase.removeChannel(channel); };
  };

  const fetchUserProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      if (data) {
        const userProfile: UserProfile = {
           id: data.id,
           username: data.username || 'Hero',
           class: data.class as ClassType,
           trainingPath: data.training_path as TrainingPath || TrainingPath.BODYBUILDING,
           difficulty: data.difficulty as Difficulty || Difficulty.BEGINNER,
           programMode: data.program_mode || 'normal',
           level: data.level,
           current_xp: data.current_xp,
           max_xp: data.max_xp,
           gold: data.gold,
           attributes: data.attributes,
           stats: data.stats,
           streak: data.streak,
           guildId: data.guild_id,
           completedWorkouts: data.completed_workouts || [], 
           gender: data.gender,
           height: data.height,
           weight: data.weight,
           avatar_url: authUser.user_metadata?.avatar_url || data.avatar_url 
        };
        setUser(userProfile);
        if (!userProfile.class) setView('onboarding');
        setIsLoading(false);
      } else {
        await createNewProfile(authUser);
      }
    } catch (error) { setIsLoading(false); }
  };

  const createNewProfile = async (authUser: User) => {
    const newProfile = {
      id: authUser.id,
      username: authUser.user_metadata?.username || 'Novice',
      class: ClassType.WARRIOR,
      training_path: TrainingPath.BODYBUILDING,
      difficulty: Difficulty.BEGINNER,
      program_mode: 'normal',
      level: 1, current_xp: 0, max_xp: 1000, gold: 100,
      attributes: { str: 10, sta: 10, will: 10 },
      stats: { squat_1rm: 0, bench_1rm: 0, deadlift_1rm: 0 },
      streak: 0, height: 175, weight: 75,
      completed_workouts: [],
    };
    const { error } = await supabase.from('profiles').upsert([newProfile]);
    if (!error) { setUser({ ...newProfile, guildId: null, completedWorkouts: [] } as any); setView('onboarding'); }
    else { setUser({ ...MOCK_USER, id: authUser.id }); setView('map'); }
    setIsLoading(false);
  };

  const handleCompleteOnboarding = async (data: any) => {
    if (!user) return;
    setIsLoading(true);
    const updated = { ...user, ...data };
    if (data.avatar_url) updated.avatar_url = data.avatar_url;
    setUser(updated);
    await supabase.from('profiles').update(updated).eq('id', user.id);
    setView('map');
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
    await supabase.from('profiles').update({ class: newClass }).eq('id', user.id);
  };
  
  const handleUpdateAvatar = (newUrl: string) => {
      if (!user) return;
      setUser(prev => prev ? ({ ...prev, avatar_url: newUrl }) : null);
  };

  const handleUpdateStats = async (newStats: Stats) => {
    if (!user) return;
    setUser(prev => prev ? ({ ...prev, stats: newStats }) : null);
    await supabase.from('profiles').update({ stats: newStats }).eq('id', user.id);
  };

  const handleUpdateTrainingPath = async (newPath: TrainingPath) => {
    if (!user) return;
    setUser(prev => prev ? ({ ...prev, trainingPath: newPath }) : null);
    await supabase.from('profiles').update({ training_path: newPath }).eq('id', user.id);
  };

  const handleUpdateProgramMode = async (mode: 'normal' | 'heavy') => {
      if (!user) return;
      setUser(prev => prev ? ({ ...prev, programMode: mode }) : null);
      await supabase.from('profiles').update({ program_mode: mode }).eq('id', user.id);
      triggerNotification(`Mode changed to: ${mode === 'heavy' ? 'Heavy' : 'Normal'}`);
  };

  // --- GEN AI HANDLER ---
  const handleGenerateCustomWorkout = async () => {
      if(!user || !customPrompt.trim()) return;
      setIsGenerating(true);
      const workout = await generateCustomWorkout(customPrompt, user);
      setIsGenerating(false);
      
      if(workout) {
          setActiveNode(workout);
          setView('workout');
          setCustomPrompt('');
      } else {
          triggerNotification("Failed to generate workout.");
      }
  };

  const handleNodeClick = (node: WorkoutNode) => {
    setActiveNode(node);
    setView('workout');
  };
  
  const handleWorkoutComplete = async (xp: number, gold: number, exercises: Exercise[]) => {
      if (!user || !activeNode) return;

      const newXp = user.current_xp + xp;
      const leveledUp = newXp >= user.max_xp;
      
      const updatedCompletedWorkouts = [...new Set([...user.completedWorkouts, activeNode.id])];

      const updatedUser = {
        ...user,
        current_xp: leveledUp ? newXp - user.max_xp : newXp,
        level: leveledUp ? user.level + 1 : user.level,
        max_xp: leveledUp ? Math.floor(user.max_xp * 1.2) : user.max_xp,
        gold: user.gold + gold,
        streak: user.streak + 1,
        completedWorkouts: updatedCompletedWorkouts
      };
      
      setUser(updatedUser);
      setPartnerMode(null);
      if (leveledUp) triggerNotification(`${t.levelUp} ${t.lvl} ${updatedUser.level}`, 5000);
      setView('map');
      
      // Save Profile
      await supabase.from('profiles').update({ 
          current_xp: updatedUser.current_xp, 
          level: updatedUser.level, 
          max_xp: updatedUser.max_xp, 
          gold: updatedUser.gold, 
          streak: updatedUser.streak,
          completed_workouts: updatedCompletedWorkouts 
      }).eq('id', user.id);

      // Log to History
      try {
          await supabase.from('workout_logs').insert({
              user_id: user.id,
              workout_title: activeNode.title,
              xp_earned: xp,
              gold_earned: gold,
              completed_at: new Date().toISOString(),
              exercises: exercises // Save full exercises details
          });
      } catch (e) { console.error("Log error", e); }

      setActiveNode(null);
  };

  const handleExitWorkout = () => { setView('map'); setActiveNode(null); setPartnerMode(null); };
  
  const handleJoinGuild = async (id: string) => { 
      if (!user) return;
      const targetGuild = guilds.find(g => g.id === id);
      if (targetGuild && targetGuild.members >= targetGuild.maxMembers) { triggerNotification(t.full + "!"); return; }

      const oldGuildId = user.guildId;
      setUser(prev => prev ? ({ ...prev, guildId: id }) : null);
      setGuilds(prev => prev.map(g => {
          if (g.id === id) return { ...g, members: g.members + 1 };
          if (g.id === oldGuildId) return { ...g, members: Math.max(0, g.members - 1) };
          return g;
      }));
      triggerNotification(t.completed + "!");
      try {
          await supabase.from('profiles').update({ guild_id: id }).eq('id', user.id);
          await supabase.rpc('increment_guild_member', { guild_id_param: id });
          if (oldGuildId) await supabase.rpc('decrement_guild_member', { guild_id_param: oldGuildId });
      } catch (e) { console.error("Join guild error", e); }
  };

  const handleLeaveGuild = async () => { 
      if (!user || !user.guildId) return;
      const oldGuildId = user.guildId;
      setUser(prev => prev ? ({ ...prev, guildId: null }) : null);
      setGuilds(prev => prev.map(g => g.id === oldGuildId ? { ...g, members: Math.max(0, g.members - 1) } : g));
      triggerNotification(t.completed + ".");
      try {
          await supabase.from('profiles').update({ guild_id: null }).eq('id', user.id);
          await supabase.rpc('decrement_guild_member', { guild_id_param: oldGuildId });
      } catch (e) { console.error("Leave guild error", e); }
  };

  const handleCreateGuild = async (data: any) => { 
      if (!user) return;
      try {
          const guildId = crypto.randomUUID();
          
          // Insert into DB
          const { data: newGuildData, error } = await supabase.from('guilds').insert([{
              id: guildId, name: data.name, description: data.description, icon: data.icon,
              members: 1, max_members: 30, total_xp: 0, rank: guilds.length + 1
          }]).select().single();
          
          if (error) throw error;

          // Update Profile
          await supabase.from('profiles').update({ guild_id: newGuildData.id }).eq('id', user.id);

          // Update Local State IMMEDIATELY
          const newGuildMapped: Guild = { 
            id: newGuildData.id, 
            name: newGuildData.name, 
            description: newGuildData.description, 
            icon: newGuildData.icon,
            members: 1,
            maxMembers: 30, 
            totalXp: 0, 
            rank: guilds.length + 1
          };

          setUser(prev => prev ? ({ ...prev, guildId: newGuildData.id }) : null);
          setGuilds(prev => [...prev, newGuildMapped]);
          
          triggerNotification("Guild Created!");
      } catch (error: any) { 
          console.error("Guild creation error", error);
          triggerNotification("Error: " + error.message); 
      }
  };

  const handleBuyItem = (item: any) => { 
       if (!user) return;
       if (user.gold < item.price) { triggerNotification(t.notEnoughGold); return; }
       const newGold = user.gold - item.price;
       setUser(prev => prev ? ({ ...prev, gold: newGold }) : null);
       setUserInventory(prev => [...prev, { ...item, id: `i-${Date.now()}`, is_equipped: false }]);
       triggerNotification(`${t.purchased} ${item.name}!`);
       supabase.from('profiles').update({ gold: newGold }).eq('id', user.id);
  };
  const handleToggleEquip = (item: any) => { setUserInventory(prev => prev.map(i => i.id === item.id ? { ...i, is_equipped: !item.is_equipped } : i)); };
  
  const handleStartSharedWorkout = async (name: string, id: string) => { 
      if (!user) return;
      // Simplification: Shared workout just picks first BB workout or active one
      const nextWorkout = activeNode || CAMPAIGN_DATA[TrainingPath.BODYBUILDING][0];
      try {
          await supabase.from('workout_invites').insert({ sender_id: user.id, receiver_id: id, workout_id: nextWorkout.id, status: 'pending' });
          triggerNotification(`Invited ${name}!`);
      } catch (e) { triggerNotification("Failed to send invite."); }
  };

  const acceptInvite = async () => { 
      if (incomingInvite) { 
          try {
             await supabase.from('workout_invites').update({ status: 'accepted' }).eq('id', incomingInvite.id);
             
             // Find the workout
             let foundNode = null;
             Object.values(CAMPAIGN_DATA).forEach(path => {
                const node = path.find(n => n.id === incomingInvite.workoutId);
                if (node) foundNode = node;
             });

             setPartnerMode(incomingInvite.senderName || 'Partner'); 
             if(foundNode) setActiveNode(foundNode);
             setView('workout');
             setIncomingInvite(null); 
          } catch(e) {
              console.error(e);
              triggerNotification("Error joining session");
          }
      } 
  };

  // --- RENDER ---
  if (isLoading) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center"><Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" /><p className="text-slate-400 font-bold uppercase text-sm">{t.loading}</p></div>;
  if (!session || !user) return <AuthView currentLang={settings.language} onToggleLang={(l) => handleUpdateSettings({ language: l })} />;
  if (view === 'onboarding') return <OnboardingView user={user} lang={settings.language} onComplete={handleCompleteOnboarding} />;

  // Determine Map Content
  let currentNodes: WorkoutNode[] = [];
  if (user.trainingPath === TrainingPath.CUSTOM) {
      currentNodes = []; // No map for custom
  } else {
      const map = CAMPAIGN_DATA[user.trainingPath || TrainingPath.BODYBUILDING];
      currentNodes = map.map((node, index) => {
          if (user.completedWorkouts.includes(node.id)) return { ...node, status: 'completed' };
          const prevNode = index > 0 ? map[index - 1] : null;
          if (!prevNode || user.completedWorkouts.includes(prevNode.id)) return { ...node, status: 'available' };
          return { ...node, status: 'locked' };
      });
  }
  
  const xpPercentage = Math.min(100, (user.current_xp / user.max_xp) * 100);
  const trainingPaths = [
    { path: TrainingPath.BODYBUILDING, icon: Dumbbell, name: t.bodybuilding },
    { path: TrainingPath.POWERLIFTING, icon: WeightIcon, name: t.powerlifting },
    { path: TrainingPath.CUSTOM, icon: Brain, name: t.customWorkout }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex justify-center">
      <div className="w-full max-w-md bg-slate-950 min-h-screen shadow-2xl relative flex flex-col">
        {view === 'workout' && activeNode ? (
          <ActiveSession workout={activeNode} user={user} lang={settings.language} partnerName={partnerMode} onComplete={handleWorkoutComplete} onExit={handleExitWorkout} />
        ) : (
          <>
            <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800 p-2 flex justify-between items-center gap-3 shadow-lg">
               <div className="flex items-center gap-3 flex-1 bg-slate-900/80 border-slate-800 p-1.5 pr-4 rounded-full border">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center font-black text-slate-900 border-2 border-slate-900 shrink-0 shadow-lg text-lg overflow-hidden">
                    {user.avatar_url ? <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : user.level}
                 </div>
                 <div className="flex flex-col flex-1 gap-0.5">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400"><span>{t.xp}</span><span>{Math.floor(xpPercentage)}%</span></div>
                    <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50"><div className="h-full bg-violet-500 rounded-full" style={{ width: `${xpPercentage}%` }}></div></div>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                  <div className="bg-slate-900 border-slate-800 px-3 py-1.5 rounded-full border flex items-center gap-2 shadow-inner"><span className="text-amber-400 font-mono font-bold text-lg">{user.gold}</span><span className="text-xl">🪙</span></div>
                  <button onClick={() => setView('settings')} className={`p-2 rounded-full transition-colors ${view === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}><Settings className="w-6 h-6" /></button>
               </div>
            </div>

            {notification && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 px-6 py-3 rounded-full font-bold shadow-xl animate-bounce text-center border-2 border-amber-300">{notification}</div>}
            {incomingInvite && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border-amber-500 border rounded-xl p-4 shadow-2xl"><h4 className="font-bold">{t.workoutInvite}</h4><div className="flex gap-2 mt-2"><button onClick={acceptInvite} className="bg-green-600 px-3 py-1 rounded">{t.acceptInvite}</button><button onClick={() => setIncomingInvite(null)} className="bg-slate-700 px-3 py-1 rounded">{t.declineInvite}</button></div></div>}

            <div className="flex-1 overflow-y-auto pb-24 bg-slate-950">
              {view === 'map' && (
                <div className="p-4">
                  <CharacterDisplay user={user} lang={settings.language} onUpdateClass={handleUpdateClass} onUpdateStats={handleUpdateStats} onUpdateAvatar={handleUpdateAvatar} />
                  <div className="mt-6 relative z-10">
                    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700 shadow-xl mb-6">
                        <div className="mb-4">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">{t.selectPath}</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {trainingPaths.map((p) => (
                                    <button key={p.path} onClick={() => handleUpdateTrainingPath(p.path)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${user.trainingPath === p.path ? 'bg-amber-600 border-amber-500 text-slate-950' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                                        <p.icon className={`w-5 h-5 ${user.trainingPath === p.path ? 'text-white' : ''}`} />
                                        <span className="text-xs font-bold uppercase">{p.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {user.trainingPath === TrainingPath.CUSTOM ? (
                        <div className="p-6 bg-slate-900 border border-slate-700 rounded-2xl flex flex-col items-center text-center">
                            <Brain className="w-12 h-12 text-violet-500 mb-4 animate-pulse" />
                            <h3 className="text-xl font-bold text-white mb-2">{t.customWorkout}</h3>
                            <textarea 
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder={t.aiPromptPlaceholder}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white mb-4 focus:border-violet-500 outline-none resize-none h-24"
                            />
                            <button 
                                onClick={handleGenerateCustomWorkout}
                                disabled={isGenerating || !customPrompt.trim()}
                                className="w-full py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {isGenerating ? t.generating : t.generateWorkout}
                            </button>
                        </div>
                    ) : (
                        <WorkoutMap nodes={currentNodes} onNodeClick={handleNodeClick} />
                    )}
                  </div>
                </div>
              )}
              {view === 'profile' && <div className="p-4"><CharacterDisplay user={user} lang={settings.language} onUpdateClass={handleUpdateClass} onUpdateStats={handleUpdateStats} onUpdateAvatar={handleUpdateAvatar} /><div className="mt-6"><Inventory items={userInventory} lang={settings.language} onToggleEquip={handleToggleEquip} /></div></div>}
              {view === 'guild' && <GuildsView guilds={guilds} userGuildId={user.guildId} username={user.username} currentUserId={user.id} lang={settings.language} onJoinGuild={handleJoinGuild} onLeaveGuild={handleLeaveGuild} onCreateGuild={handleCreateGuild} onStartSharedWorkout={handleStartSharedWorkout} />}
              {view === 'shop' && <ShopView items={MOCK_SHOP_ITEMS} userGold={user.gold} userLevel={user.level} lang={settings.language} onBuy={handleBuyItem} />}
              {view === 'avatar' && <AvatarView user={user} inventory={userInventory} lang={settings.language} onToggleEquip={handleToggleEquip} />}
              {view === 'history' && <HistoryView user={user} lang={settings.language} />}
              {view === 'settings' && <SettingsView settings={settings} onUpdateSettings={handleUpdateSettings} onLogout={handleLogout} />}
            </div>

            <div className="fixed bottom-0 w-full max-w-md bg-slate-900 border-slate-800 border-t p-2 pb-4 flex justify-between px-2 items-center z-40">
              <button onClick={() => setView('map')} className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 ${view === 'map' ? 'text-amber-500' : 'text-slate-500'}`}><Map className="w-5 h-5" /><span className="text-[9px] uppercase font-bold">{t.map}</span></button>
              <button onClick={() => setView('guild')} className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 ${view === 'guild' ? 'text-amber-500' : 'text-slate-500'}`}><Users className="w-5 h-5" /><span className="text-[9px] uppercase font-bold">{t.social}</span></button>
              <button onClick={() => setView('avatar')} className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 ${view === 'avatar' ? 'text-amber-500' : 'text-slate-500'}`}><Sparkles className="w-5 h-5" /><span className="text-[9px] uppercase font-bold">{t.avatarTitle}</span></button>
              <button onClick={() => setView('shop')} className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 ${view === 'shop' ? 'text-amber-500' : 'text-slate-500'}`}><ShoppingBag className="w-5 h-5" /><span className="text-[9px] uppercase font-bold">{t.shop}</span></button>
              <button onClick={() => setView('history')} className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 ${view === 'history' ? 'text-amber-500' : 'text-slate-500'}`}><Scroll className="w-5 h-5" /><span className="text-[9px] uppercase font-bold">{t.history}</span></button>
              <button onClick={() => setView('profile')} className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 ${view === 'profile' ? 'text-amber-500' : 'text-slate-500'}`}><UserIcon className="w-5 h-5" /><span className="text-[9px] uppercase font-bold">{t.hero}</span></button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
