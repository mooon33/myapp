import React, { useState, useRef } from 'react';
import { UserProfile, ClassType, Stats } from '../types';
import { Shield, Zap, Brain, Trophy, ChevronRight, X, Swords, Activity, Target, Pencil, Save, Camera, Loader2 } from 'lucide-react';
import { TRANSLATIONS, SPRITE_EVOLUTION } from '../constants';
import { supabase } from '../lib/supabaseClient';

interface Props {
  user: UserProfile;
  lang: 'en' | 'ru';
  onUpdateClass?: (newClass: ClassType) => void;
  onUpdateStats?: (newStats: Stats) => void;
  onUpdateAvatar?: (newUrl: string) => void;
}

const CharacterDisplay: React.FC<Props> = ({ user, lang, onUpdateClass, onUpdateStats, onUpdateAvatar }) => {
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [activeAttribute, setActiveAttribute] = useState<'str' | 'sta' | 'will' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Stats Editing State
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [tempStats, setTempStats] = useState<Stats>(user.stats);
  
  const t = TRANSLATIONS[lang];
  
  const CLASS_DESCRIPTIONS = {
      [ClassType.WARRIOR]: { desc: t.warriorDesc, bonus: "+Bonus STR" },
      [ClassType.SCOUT]: { desc: t.scoutDesc, bonus: "+Bonus STA" },
      [ClassType.MONK]: { desc: t.monkDesc, bonus: "+Bonus WILL" },
  };

  const ATTRIBUTE_INFO = {
    str: { name: t.attributes.str, desc: t.attributes.strDesc },
    sta: { name: t.attributes.sta, desc: t.attributes.staDesc },
    will: { name: t.attributes.will, desc: t.attributes.willDesc }
  };

  const xpPercentage = (user.current_xp / user.max_xp) * 100;

  // Determine current sprite based on level OR use custom avatar
  const currentEvolution = SPRITE_EVOLUTION
    .slice()
    .sort((a, b) => b.level - a.level) // Sort descending to find highest match
    .find(m => user.level >= m.level) || SPRITE_EVOLUTION[0];
    
  const displayImage = user.avatar_url || currentEvolution.imageUrl;

  const handleClassSelect = (c: ClassType) => {
    if (onUpdateClass) {
      onUpdateClass(c);
    }
    setShowClassSelector(false);
  };

  const handleSaveStats = () => {
    if (onUpdateStats) {
      onUpdateStats(tempStats);
    }
    setIsEditingStats(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    setIsUploading(true);

    try {
        // 1. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('user-avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('user-avatars')
            .getPublicUrl(filePath);

        // 3. Update User Profile
        // Strategy: First update Auth Metadata (Reliable, no schema needed)
        const { error: authError } = await supabase.auth.updateUser({
            data: { avatar_url: publicUrl }
        });

        if (authError) throw authError;

        // Then try to update Profiles table (for social features)
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id);

        if (updateError) {
             // If DB update fails, we warn but don't stop execution
             console.error("Profile sync error:", updateError);
             if (updateError.code === 'PGRST204') {
                 alert("Avatar saved to account! Note: To make it visible to others in Guilds, you must add a text column 'avatar_url' to your 'profiles' table in Supabase.");
             } else if (updateError.message && updateError.message.includes('row-level security')) {
                 console.warn("RLS blocking profile update. Check policies.");
             }
        }

        // 4. Update Local State
        if (onUpdateAvatar) {
            onUpdateAvatar(publicUrl);
        }

    } catch (error: any) {
        console.error('Error uploading avatar:', error);
        
        if (error.message && error.message.includes('Bucket not found')) {
            alert('Upload failed: Bucket "user-avatars" not found.\n\nPlease go to Supabase Dashboard -> Storage -> Create a new public bucket named "user-avatars".');
        } else if (error.message && error.message.includes('row-level security')) {
             alert('Upload failed: Storage RLS Policy violation.\n\nPlease go to Supabase Dashboard -> Storage -> Policies -> Allow INSERT/UPDATE for authenticated users.');
        } else {
             alert(`Error uploading avatar: ${error.message || 'Unknown error'}`);
        }
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl relative">
      {/* Background/Banner */}
      <div className="h-32 bg-gradient-to-r from-violet-900 to-slate-900 relative overflow-hidden group">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="absolute bottom-4 left-4 flex items-end space-x-4 z-10 w-full pr-8">
          {/* Avatar Container */}
          <div className="relative group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
             <div className="w-24 h-24 rounded-xl border-4 border-slate-800 bg-slate-950 overflow-hidden shadow-lg relative transition-transform duration-300 group-hover/avatar:scale-105">
                <img 
                    src={displayImage} 
                    alt={currentEvolution.title} 
                    className={`w-full h-full object-cover ${isUploading ? 'opacity-50' : ''}`}
                />
                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-8 h-8 text-white/80" />
                </div>
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    </div>
                )}
             </div>
             <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
             />
          </div>

          <div className="mb-2 flex-1">
            <h2 className="text-2xl font-bold text-white tracking-wide flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 leading-tight">
              {user.username}
              <div className="flex gap-2">
                <span className="text-xs px-2 py-0.5 bg-amber-600 rounded text-slate-950 font-extrabold uppercase">
                    {t.lvl} {user.level}
                </span>
                <span className="text-xs px-2 py-0.5 bg-purple-600 rounded text-white font-bold uppercase tracking-wider border border-purple-400/50">
                    {currentEvolution.title}
                </span>
              </div>
            </h2>
            
            {/* Clickable Class Area */}
            <button 
              onClick={() => setShowClassSelector(true)}
              className="mt-1 flex items-center gap-2 px-2 py-1 -ml-2 rounded-lg hover:bg-white/10 transition-colors group/btn"
            >
               <span className="text-slate-300 font-medium group-hover/btn:text-white border-b border-dashed border-slate-500 group-hover/btn:border-white transition-all">
                 {user.class}
               </span>
               <ChevronRight className="w-4 h-4 text-slate-500 group-hover/btn:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 pt-4 mt-2">
        {/* XP Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono uppercase">
            <span>{t.experience}</span>
            <span>{user.current_xp} / {user.max_xp} {t.xp}</span>
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

        {/* Real Stats (Editable) */}
        <div className="mt-4 border-t border-slate-800 pt-4">
          <div className="flex justify-between items-center mb-3">
             <div className="flex items-center gap-2 text-slate-300">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold uppercase">{t.personalRecords}</span>
             </div>
             <button 
                onClick={() => {
                  setTempStats(user.stats);
                  setIsEditingStats(true);
                }}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
             >
                <Pencil className="w-3 h-3" />
             </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
             <div className="bg-slate-950/50 p-2 rounded border border-slate-800">
                <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">{t.squat}</div>
                <div className="font-mono text-slate-200 font-bold">{user.stats.squat_1rm} <span className="text-[10px] text-slate-500">kg</span></div>
             </div>
             <div className="bg-slate-950/50 p-2 rounded border border-slate-800">
                <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">{t.bench}</div>
                <div className="font-mono text-slate-200 font-bold">{user.stats.bench_1rm} <span className="text-[10px] text-slate-500">kg</span></div>
             </div>
             <div className="bg-slate-950/50 p-2 rounded border border-slate-800">
                <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">{t.deadlift}</div>
                <div className="font-mono text-slate-200 font-bold">{user.stats.deadlift_1rm} <span className="text-[10px] text-slate-500">kg</span></div>
             </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Edit Stats Modal */}
      {isEditingStats && (
         <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-sm p-6 flex items-center justify-center animate-in fade-in duration-200">
            <div className="w-full max-w-xs">
               <h3 className="text-lg font-bold text-white mb-6 text-center">{t.updateRecords}</h3>
               
               <div className="space-y-4 mb-6">
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t.squat} (kg)</label>
                     <input 
                        type="number" 
                        value={tempStats.squat_1rm}
                        onChange={(e) => setTempStats(prev => ({...prev, squat_1rm: Number(e.target.value)}))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono focus:border-amber-500 outline-none"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t.bench} (kg)</label>
                     <input 
                        type="number" 
                        value={tempStats.bench_1rm}
                        onChange={(e) => setTempStats(prev => ({...prev, bench_1rm: Number(e.target.value)}))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono focus:border-amber-500 outline-none"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t.deadlift} (kg)</label>
                     <input 
                        type="number" 
                        value={tempStats.deadlift_1rm}
                        onChange={(e) => setTempStats(prev => ({...prev, deadlift_1rm: Number(e.target.value)}))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono focus:border-amber-500 outline-none"
                     />
                  </div>
               </div>

               <div className="flex gap-3">
                  <button 
                     onClick={() => setIsEditingStats(false)}
                     className="flex-1 py-2 rounded-lg font-bold bg-slate-800 text-slate-400 hover:bg-slate-700"
                  >
                     {t.cancel}
                  </button>
                  <button 
                     onClick={handleSaveStats}
                     className="flex-1 py-2 rounded-lg font-bold bg-amber-600 text-slate-950 hover:bg-amber-500 flex items-center justify-center gap-2"
                  >
                     <Save className="w-4 h-4" /> {t.save}
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Class Selector Modal */}
      {showClassSelector && (
        <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-sm p-4 flex flex-col animate-in fade-in duration-200">
           <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
             <h3 className="text-lg font-bold text-white">{t.selectClass}</h3>
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
          className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-6 animate-in fade-in duration-200"
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
                {t.gotIt}
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default CharacterDisplay;