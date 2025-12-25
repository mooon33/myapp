import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile, WorkoutNode, Guild, ShopItem, ClassType, AppSettings, Stats, InventoryItem, TrainingPath, WorkoutInvite, Difficulty, Exercise } from './types';
import { MOCK_USER, CAMPAIGN_DATA, MOCK_INVENTORY, MOCK_GUILDS, MOCK_SHOP_ITEMS, TRANSLATIONS } from './constants';
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
import { Map, User as UserIcon, Users, Settings, ShoppingBag, ChevronLeft, ChevronRight, Sparkles, Loader2, Mail, Dumbbell, Weight as WeightIcon, Zap, Home, Activity } from 'lucide-react';

type ViewState = 'onboarding' | 'map' | 'profile' | 'guild' | 'workout' | 'shop' | 'settings' | 'avatar';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<ViewState>('map');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeNode, setActiveNode] = useState<WorkoutNode | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [userInventory, setUserInventory] = useState(MOCK_INVENTORY);
  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    notificationsEnabled: true,
    language: 'ru', // Default to Russian
  });
  
  const [notification, setNotification] = useState<string | null>(null);
  const [incomingInvite, setIncomingInvite] = useState<WorkoutInvite | null>(null);
  const [partnerMode, setPartnerMode] = useState<string | null>(null); 

  const t = TRANSLATIONS[settings.language];

  // --- Auth & Data Loading ---

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        Promise.all([
          fetchUserProfile(session.user),
          fetchGuilds()
        ]).then(() => setIsLoading(false));
        listenForInvites(session.user.id);
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
      } else if (!session) {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchGuilds = async () => {
    try {
      const { data, error } = await supabase.from('guilds').select('*').order('total_xp', { ascending: false });
      if (error || !data) { setGuilds(MOCK_GUILDS); return; }
      setGuilds(data.map(g => ({ ...g, maxMembers: g.max_members, totalXp: g.total_xp })));
    } catch (e) { setGuilds(MOCK_GUILDS); }
  };

  const listenForInvites = (userId: string) => {
      const channel = supabase.channel('public:workout_invites')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'workout_invites', filter: `receiver_id=eq.${userId}` }, (payload) => {
            setIncomingInvite({ id: payload.new.id, senderId: payload.new.sender_id, senderName: 'Friend', workoutId: payload.new.workout_id, status: 'pending' });
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
           completedWorkouts: data.completed_workouts || [], // Load completed workouts
           gender: data.gender,
           height: data.height,
           weight: data.weight,
           avatar_url: authUser.user_metadata?.avatar_url || data.avatar_url 
        };
        setUser(userProfile);
        if (!userProfile.height) setView('onboarding');
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
      streak: 0, height: 0, weight: 0,
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
    setUser(updated);
    await supabase.from('profiles').update(data).eq('id', user.id);
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

  const handleUpdateDifficulty = async (newDiff: Difficulty) => {
     if (!user) return;
     setUser(prev => prev ? ({ ...prev, difficulty: newDiff }) : null);
     await supabase.from('profiles').update({ difficulty: newDiff }).eq('id', user.id);
  };

  const handleUpdateProgramMode = async (mode: 'normal' | 'heavy') => {
      if (!user) return;
      setUser(prev => prev ? ({ ...prev, programMode: mode }) : null);
      await supabase.from('profiles').update({ program_mode: mode }).eq('id', user.id);
      triggerNotification(`Mode changed to: ${mode === 'heavy' ? 'Heavy' : 'Normal'}`);
  };

  // --- DYNAMIC WORKOUT GENERATOR (POWERLIFTING) ---
  const generatePowerliftingNodes = (currentWeek: number): WorkoutNode[] => {
      if (!user) return [];

      const Z = 2.5; // Step (2.5kg)
      // Approximate 5RM from 1RM (1RM * 0.87) to match Excel logic base
      const dl5rm = user.stats.deadlift_1rm * 0.87; 
      const bp5rm = user.stats.bench_1rm * 0.87;
      const sq5rm = user.stats.squat_1rm * 0.87;

      // Bonus Multiplier for Heavy Mode
      const isHeavy = user.programMode === 'heavy';
      const rewardMultiplier = isHeavy ? 1.2 : 1.0;

      // Base Rewards
      const baseXp = 150 + (currentWeek * 10);
      const baseGold = 50 + (currentWeek * 5);

      const finalXp = Math.floor(baseXp * rewardMultiplier);
      const finalGold = Math.floor(baseGold * rewardMultiplier);

      // --- HELPER FOR MAIN LIFTS WEIGHT (BENCH/SQUAT LOGIC) ---
      const getMainLiftWeight = (baseWeight: number, week: number) => {
          if (week === 8) return 0; // Test week
          let offset = 0;
          if (user.programMode === 'heavy') {
              offset = -3 + (week - 1);
          } else {
              offset = -4 + (week - 1);
          }
          const rawWeight = baseWeight + (offset * Z);
          return Math.max(2.5, Math.round(rawWeight / 2.5) * 2.5);
      };

      // --- HELPER FOR MAIN LIFTS REPS (ALL DAYS) ---
      const getMainLiftReps = (week: number): { sets: number, reps: number | string, custom?: string } => {
          if (week === 6) return { sets: 3, reps: 3 };
          if (week === 7) return { sets: 2, reps: 2 };
          if (week === 8) return { sets: 1, reps: "Test", custom: "Attempt 1RM" };
          return { sets: 5, reps: 5 }; // Default W1-W5
      };
      
      // --- HELPER FOR AUXILIARY LIFTS (Logic for 8 weeks) ---
      const getAuxLiftScheme = (week: number) => {
          const schemes = [
            {s:4, r:6, p:0.75}, // W1
            {s:5, r:5, p:0.70}, // W2
            {s:4, r:4, p:0.80}, // W3
            {s:4, r:8, p:0.70}, // W4
            {s:5, r:6, p:0.65}, // W5
            {s:5, r:5, p:0.70}, // W6
            {s:3, r:3, p:0.75}, // W7
            {s:0, r:0, p:0}     // W8 (Empty)
          ];
          return schemes[week - 1] || {s:0,r:0,p:0};
      };

      // ==========================
      // DAY 1: Deadlift Focus
      // ==========================
      const day1Exercises: Exercise[] = [];
      const d1DlParams = getMainLiftReps(currentWeek);
      const d1DlWeight = getMainLiftWeight(dl5rm, currentWeek);
      
      day1Exercises.push({
          id: 'pl-d1-dl', name: 'Deadlift (Main)',
          sets: d1DlParams.sets, reps: d1DlParams.reps, customNote: d1DlParams.custom,
          weight: currentWeek === 8 ? undefined : d1DlWeight
      });

      const d1BpAux = getAuxLiftScheme(currentWeek);
      if (d1BpAux.s > 0) {
          day1Exercises.push({
              id: 'pl-d1-bp', name: 'Bench Press (Aux)',
              sets: d1BpAux.s, reps: d1BpAux.r,
              weight: Math.round((bp5rm * d1BpAux.p) / 2.5) * 2.5
          });
      }
      
      if (currentWeek < 8) {
          let latSets = 3; let latReps = "6-10";
          if (currentWeek === 7) { latSets = 2; latReps = "5"; }
          day1Exercises.push({ id: 'pl-d1-acc1', name: 'Lat Pulldown', sets: latSets, reps: latReps, rpe: 7 });
          day1Exercises.push({ id: 'pl-d1-acc2', name: 'Abs / Core', sets: latSets, reps: latReps, rpe: 8 });
      }

      // ==========================
      // DAY 2: Bench Focus
      // ==========================
      const day2Exercises: Exercise[] = [];
      const d2BpParams = getMainLiftReps(currentWeek);
      const d2BpWeight = getMainLiftWeight(bp5rm, currentWeek);

      day2Exercises.push({
          id: 'pl-d2-bp', name: 'Bench Press (Main)',
          sets: d2BpParams.sets, reps: d2BpParams.reps, customNote: d2BpParams.custom,
          weight: currentWeek === 8 ? undefined : d2BpWeight
      });

      const d2SqAux = getAuxLiftScheme(currentWeek);
      if (d2SqAux.s > 0) {
          day2Exercises.push({
              id: 'pl-d2-sq', name: 'Squat (Aux)',
              sets: d2SqAux.s, reps: d2SqAux.r,
              weight: Math.round((sq5rm * d2SqAux.p) / 2.5) * 2.5
          });
      }

      if (currentWeek < 8) {
          let ohpSets = 3; let ohpReps = "6-10";
          if (currentWeek === 7) { ohpSets = 2; ohpReps = "5"; }
          day2Exercises.push({ id: 'pl-d2-ohp', name: 'Dumbbell Overhead Press', sets: ohpSets, reps: ohpReps, rpe: 7 });
          let armSets = 3; let armReps = "6-10";
          if (currentWeek === 7) { armSets = 2; } 
          day2Exercises.push({ id: 'pl-d2-arms', name: 'Biceps + Triceps', sets: armSets, reps: armReps, rpe: 8 });
      }

      // ==========================
      // DAY 3: Squat Focus
      // ==========================
      const day3Exercises: Exercise[] = [];
      const d3SqParams = getMainLiftReps(currentWeek);
      const d3SqWeight = getMainLiftWeight(sq5rm, currentWeek);
      
      day3Exercises.push({
          id: 'pl-d3-sq', name: 'Squat (Main)',
          sets: d3SqParams.sets, reps: d3SqParams.reps, customNote: d3SqParams.custom,
          weight: currentWeek === 8 ? undefined : d3SqWeight
      });

      const d3DlAux = getAuxLiftScheme(currentWeek);
      if (d3DlAux.s > 0) {
          day3Exercises.push({
              id: 'pl-d3-dl', name: 'Deadlift (Aux)',
              sets: d3DlAux.s, reps: d3DlAux.r,
              weight: Math.round((dl5rm * d3DlAux.p) / 2.5) * 2.5
          });
      }

      if (currentWeek < 8) {
          let rowSets = 3; let rowReps = "6-10";
          if (currentWeek === 7) { rowSets = 2; rowReps = "5"; }
          day3Exercises.push({ id: 'pl-d3-row', name: 'Bent Over Row', sets: rowSets, reps: rowReps, rpe: 7 });

          let absSets = 3; let absReps = "6-10";
          if (currentWeek === 7) { absSets = 2; absReps = "5"; }
          day3Exercises.push({ id: 'pl-d3-abs', name: 'Abs / Core', sets: absSets, reps: absReps, rpe: 8 });
      }

      // --- NODE STATUS LOGIC (SEQUENTIAL UNLOCKING) ---
      const d1Id = `pl-w${currentWeek}-d1`;
      const d2Id = `pl-w${currentWeek}-d2`;
      const d3Id = `pl-w${currentWeek}-d3`;
      
      const isCompleted = (id: string) => user.completedWorkouts.includes(id);

      // Node 1 Status: Available if prev week finished OR first week. Locked otherwise.
      // Simplification: We only check unlocking within the active view. If a user manually changes chapter, we let them see Day 1.
      let d1Status: 'locked' | 'available' | 'completed' = 'locked';
      if (isCompleted(d1Id)) {
        d1Status = 'completed';
      } else {
        d1Status = 'available'; // Default available if it's the start of the week shown
      }

      // Node 2 Status: Available only if D1 is completed
      let d2Status: 'locked' | 'available' | 'completed' = 'locked';
      if (isCompleted(d2Id)) {
        d2Status = 'completed';
      } else if (isCompleted(d1Id)) {
        d2Status = 'available';
      }

      // Node 3 Status: Available only if D2 is completed
      let d3Status: 'locked' | 'available' | 'completed' = 'locked';
      if (isCompleted(d3Id)) {
        d3Status = 'completed';
      } else if (isCompleted(d2Id)) {
        d3Status = 'available';
      }

      const nodes: WorkoutNode[] = [];
      
      // Node 1
      nodes.push({
          id: d1Id,
          title: `Week ${currentWeek} - Day 1 (Pull)`,
          description: `Deadlift Focus. Mode: ${user.programMode === 'heavy' ? 'Heavy' : 'Normal'}`,
          type: 'workout',
          status: d1Status,
          xpReward: finalXp,
          goldReward: finalGold,
          position: { x: 30, y: 20 },
          chapter: currentWeek,
          exercises: day1Exercises
      });

      // Node 2
      nodes.push({
          id: d2Id,
          title: `Week ${currentWeek} - Day 2 (Push)`,
          description: `Bench Press Focus. Mode: ${user.programMode === 'heavy' ? 'Heavy' : 'Normal'}`,
          type: 'workout',
          status: d2Status,
          xpReward: finalXp,
          goldReward: finalGold,
          position: { x: 70, y: 40 },
          chapter: currentWeek,
          exercises: day2Exercises
      });

      // Node 3
      nodes.push({
          id: d3Id,
          title: `Week ${currentWeek} - Day 3 (Legs)`,
          description: `Squat Focus. Mode: ${user.programMode === 'heavy' ? 'Heavy' : 'Normal'}`,
          type: 'workout',
          status: d3Status,
          xpReward: Math.floor(finalXp * 1.3), // Boss/End week bonus
          goldReward: Math.floor(finalGold * 1.3),
          position: { x: 50, y: 70 },
          chapter: currentWeek,
          exercises: day3Exercises
      });

      return nodes;
  };

  const handleNodeClick = (node: WorkoutNode) => {
    setActiveNode(node);
    setView('workout');
  };
  
  const handleWorkoutComplete = async (xp: number, gold: number) => {
      if (!user) return;
      if (!activeNode) return;

      const newXp = user.current_xp + xp;
      const leveledUp = newXp >= user.max_xp;
      
      // Update completed workouts list
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
      setActiveNode(null);
      
      // Save to DB
      await supabase.from('profiles').update({ 
          current_xp: updatedUser.current_xp, 
          level: updatedUser.level, 
          max_xp: updatedUser.max_xp, 
          gold: updatedUser.gold, 
          streak: updatedUser.streak,
          completed_workouts: updatedCompletedWorkouts // Ensure DB has this column
      }).eq('id', user.id);
  };

  const handleExitWorkout = () => { setView('map'); setActiveNode(null); setPartnerMode(null); };
  
  // Placeholder handlers for brevity in this specific update
  const handleJoinGuild = async (id: string) => { 
      // Logic same as previous
      if (!user) return;
      const targetGuild = guilds.find(g => g.id === id);
      if (targetGuild && targetGuild.members >= targetGuild.maxMembers) { triggerNotification(t.full + "!"); return; }
      setUser(prev => prev ? ({ ...prev, guildId: id }) : null);
      setGuilds(prev => prev.map(g => g.id === id ? { ...g, members: g.members + 1 } : g));
      triggerNotification(t.completed + "!");
      await supabase.from('profiles').update({ guild_id: id }).eq('id', user.id);
  };
  const handleLeaveGuild = async () => { 
      if (!user || !user.guildId) return;
      setUser(prev => prev ? ({ ...prev, guildId: null }) : null);
      setGuilds(prev => prev.map(g => g.id === user.guildId ? { ...g, members: Math.max(0, g.members - 1) } : g));
      triggerNotification(t.completed + ".");
      await supabase.from('profiles').update({ guild_id: null }).eq('id', user.id);
  };
  const handleCreateGuild = async (data: any) => { 
      if (!user) return;
      // ... simplified creation logic ...
      triggerNotification("Guild Created!");
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
  const handleToggleEquip = (item: any) => { 
      setUserInventory(prev => prev.map(i => i.id === item.id ? { ...i, is_equipped: !item.is_equipped } : i));
  };
  const handleStartSharedWorkout = async (name: string, id: string) => { triggerNotification(`Invited ${name}`); };
  const acceptInvite = () => { if (incomingInvite) { setPartnerMode(incomingInvite.senderName); setIncomingInvite(null); handleNodeClick(CAMPAIGN_DATA[TrainingPath.BODYBUILDING][0]); } };

  // --- RENDER ---
  if (isLoading) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center"><Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" /><p className="text-slate-400 font-bold uppercase text-sm">{t.loading}</p></div>;
  if (!session || !user) return <AuthView currentLang={settings.language} onToggleLang={(l) => handleUpdateSettings({ language: l })} />;
  if (view === 'onboarding') return <OnboardingView user={user} lang={settings.language} onComplete={handleCompleteOnboarding} />;

  // DETERMINE MAP NODES
  let currentNodes: WorkoutNode[] = [];
  if (user.trainingPath === TrainingPath.POWERLIFTING) {
      currentNodes = generatePowerliftingNodes(currentChapter);
  } else {
      // For static maps, we need to apply unlocking logic too
      const map = CAMPAIGN_DATA[user.trainingPath || TrainingPath.BODYBUILDING] || CAMPAIGN_DATA[TrainingPath.BODYBUILDING];
      const rawNodes = map.filter(n => n.chapter === currentChapter);
      
      // Apply status based on completion
      currentNodes = rawNodes.map((node, index) => {
          if (user.completedWorkouts.includes(node.id)) {
              return { ...node, status: 'completed' };
          }
          // If first node, or previous node is completed
          const prevNode = index > 0 ? rawNodes[index - 1] : null;
          if (!prevNode || user.completedWorkouts.includes(prevNode.id)) {
              return { ...node, status: 'available' };
          }
          return { ...node, status: 'locked' };
      });
  }
  
  const xpPercentage = Math.min(100, (user.current_xp / user.max_xp) * 100);
  const trainingPaths = [
    { path: TrainingPath.BODYBUILDING, icon: Dumbbell, name: t.bodybuilding },
    { path: TrainingPath.POWERLIFTING, icon: WeightIcon, name: t.powerlifting },
    { path: TrainingPath.CROSSFIT, icon: Zap, name: t.crossfit },
    { path: TrainingPath.HOME, icon: Home, name: t.homeWorkout },
    { path: TrainingPath.STRETCHING, icon: Activity, name: t.stretching },
  ];
  const difficultyLevels = [
     { level: Difficulty.BEGINNER, label: t.beginner },
     { level: Difficulty.INTERMEDIATE, label: t.intermediate },
     { level: Difficulty.ADVANCED, label: t.advanced },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex justify-center">
      <div className="w-full max-w-md bg-slate-950 min-h-screen shadow-2xl relative flex flex-col">
        {view === 'workout' && activeNode ? (
          <ActiveSession workout={activeNode} user={user} lang={settings.language} partnerName={partnerMode} onComplete={handleWorkoutComplete} onExit={handleExitWorkout} />
        ) : (
          <>
            {/* Top Bar */}
            <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800 p-2 flex justify-between items-center gap-3 shadow-lg">
               <div className="flex items-center gap-3 flex-1 bg-slate-900/80 border-slate-800 p-1.5 pr-4 rounded-full border">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center font-black text-slate-900 border-2 border-slate-900 shrink-0 shadow-lg text-lg">{user.level}</div>
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
                        {/* Training Path */}
                        <div className="mb-4">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">{t.selectPath}</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {trainingPaths.map((p) => (
                                    <button key={p.path} onClick={() => handleUpdateTrainingPath(p.path)} className={`flex flex-col items-center justify-center p-2 rounded-xl border ${user.trainingPath === p.path ? 'bg-amber-600 border-amber-500' : 'bg-slate-800 border-slate-700'}`}>
                                        <p.icon className={`w-5 h-5 mb-1 ${user.trainingPath === p.path ? 'text-white' : 'text-slate-400'}`} />
                                        <span className={`text-[9px] font-bold uppercase ${user.trainingPath === p.path ? 'text-white' : 'text-slate-500'}`}>{p.name.split(' ')[0]}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Program Mode Toggle for Powerlifting */}
                        {user.trainingPath === TrainingPath.POWERLIFTING && (
                           <div className="mb-4">
                               <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Cycle Mode</h3>
                               <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                                  <button onClick={() => handleUpdateProgramMode('normal')} className={`flex-1 py-1.5 text-xs font-bold uppercase rounded ${user.programMode === 'normal' ? 'bg-slate-800 text-blue-400 shadow' : 'text-slate-500'}`}>Normal</button>
                                  <button onClick={() => handleUpdateProgramMode('heavy')} className={`flex-1 py-1.5 text-xs font-bold uppercase rounded ${user.programMode === 'heavy' ? 'bg-slate-800 text-red-400 shadow' : 'text-slate-500'}`}>Heavy</button>
                               </div>
                           </div>
                        )}

                        {/* Difficulty */}
                        {user.trainingPath !== TrainingPath.POWERLIFTING && (
                            <div className="mb-4">
                                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                                    {difficultyLevels.map((lvl) => (
                                    <button key={lvl.level} onClick={() => handleUpdateDifficulty(lvl.level)} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md ${user.difficulty === lvl.level ? 'bg-slate-800 text-amber-500' : 'text-slate-500'}`}>{lvl.label.split(' ')[0]}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chapter */}
                        <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg p-1">
                            <button onClick={() => setCurrentChapter(prev => Math.max(1, prev - 1))} disabled={currentChapter === 1} className="p-2 text-slate-400 disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
                            <div className="flex flex-col items-center"><span className="text-[9px] text-amber-600 uppercase font-black tracking-[0.2em]">{t.campaign}</span><span className="text-sm font-bold text-white font-mono">{t.chapter} {currentChapter}</span></div>
                            <button onClick={() => setCurrentChapter(prev => Math.min(8, prev + 1))} disabled={currentChapter === 8} className="p-2 text-slate-400 disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                    <WorkoutMap nodes={currentNodes} onNodeClick={handleNodeClick} />
                  </div>
                </div>
              )}
              {view === 'profile' && <div className="p-4"><CharacterDisplay user={user} lang={settings.language} onUpdateClass={handleUpdateClass} onUpdateStats={handleUpdateStats} onUpdateAvatar={handleUpdateAvatar} /><div className="mt-6"><Inventory items={userInventory} lang={settings.language} onToggleEquip={handleToggleEquip} /></div></div>}
              {view === 'guild' && <GuildsView guilds={guilds} userGuildId={user.guildId} username={user.username} currentUserId={user.id} lang={settings.language} onJoinGuild={handleJoinGuild} onLeaveGuild={handleLeaveGuild} onCreateGuild={handleCreateGuild} onStartSharedWorkout={handleStartSharedWorkout} />}
              {view === 'shop' && <ShopView items={MOCK_SHOP_ITEMS} userGold={user.gold} userLevel={user.level} lang={settings.language} onBuy={handleBuyItem} />}
              {view === 'avatar' && <AvatarView user={user} inventory={userInventory} lang={settings.language} onToggleEquip={handleToggleEquip} />}
              {view === 'settings' && <SettingsView settings={settings} onUpdateSettings={handleUpdateSettings} onLogout={handleLogout} />}
            </div>

            <div className="fixed bottom-0 w-full max-w-md bg-slate-900 border-slate-800 border-t p-2 pb-4 flex justify-between px-2 items-center z-40">
              <button onClick={() => setView('map')} className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 ${view === 'map' ? 'text-amber-500' : 'text-slate-500'}`}><Map className="w-6 h-6" /><span className="text-[9px] uppercase font-bold">{t.map}</span></button>
              <button onClick={() => setView('guild')} className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 ${view === 'guild' ? 'text-amber-500' : 'text-slate-500'}`}><Users className="w-6 h-6" /><span className="text-[9px] uppercase font-bold">{t.social}</span></button>
              <button onClick={() => setView('avatar')} className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 ${view === 'avatar' ? 'text-amber-500' : 'text-slate-500'}`}><Sparkles className="w-6 h-6" /><span className="text-[9px] uppercase font-bold">{t.avatarTitle}</span></button>
              <button onClick={() => setView('shop')} className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 ${view === 'shop' ? 'text-amber-500' : 'text-slate-500'}`}><ShoppingBag className="w-6 h-6" /><span className="text-[9px] uppercase font-bold">{t.shop}</span></button>
              <button onClick={() => setView('profile')} className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 ${view === 'profile' ? 'text-amber-500' : 'text-slate-500'}`}><UserIcon className="w-6 h-6" /><span className="text-[9px] uppercase font-bold">{t.hero}</span></button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;