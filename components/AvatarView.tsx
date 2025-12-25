import React from 'react';
import { UserProfile, InventoryItem } from '../types';
import { SPRITE_EVOLUTION, TRANSLATIONS } from '../constants';
import { Sword, Shield, Crown, Zap } from 'lucide-react';

interface Props {
  user: UserProfile;
  inventory: InventoryItem[];
  lang: 'en' | 'ru';
  onToggleEquip: (item: InventoryItem) => void;
}

const AvatarView: React.FC<Props> = ({ user, inventory, lang, onToggleEquip }) => {
  const t = TRANSLATIONS[lang];

  // 1. Determine Current Body Stage
  const currentStageIndex = SPRITE_EVOLUTION.findIndex((s, i) => {
    const next = SPRITE_EVOLUTION[i + 1];
    if (!next) return true; // It's the last one
    return user.level >= s.level && user.level < next.level;
  });
  
  // Safe fallback if index -1
  const activeStageIndex = currentStageIndex === -1 ? SPRITE_EVOLUTION.length - 1 : currentStageIndex;
  const currentSprite = SPRITE_EVOLUTION[activeStageIndex];
  const nextSprite = SPRITE_EVOLUTION[activeStageIndex + 1];

  // 2. Calculate Progress to Next Stage
  let progressPercent = 100;
  let levelsToGo = 0;
  
  if (nextSprite) {
    const levelFloor = currentSprite.level;
    const levelCeiling = nextSprite.level;
    const totalLevelsInStage = levelCeiling - levelFloor;
    const levelsGained = user.level - levelFloor;
    progressPercent = Math.min(100, Math.max(0, (levelsGained / totalLevelsInStage) * 100));
    levelsToGo = levelCeiling - user.level;
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/40 via-slate-950 to-slate-950 z-0"></div>

      {/* 1. TOP SECTION: AVATAR ONLY */}
      <div className="relative h-[55%] w-full flex justify-center items-center mt-4">
          
          {/* Avatar Image (Centered, Clean) */}
          <div className="relative h-full w-full max-w-xs flex justify-center items-end pb-8 z-10">
              <img 
                 src={currentSprite.imageUrl} 
                 alt="Avatar" 
                 className="h-full object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] filter brightness-110"
              />
              
              {/* Form Title Badge */}
              <div className="absolute bottom-2 bg-gradient-to-r from-transparent via-slate-900 to-transparent px-8 py-1">
                 <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 tracking-widest uppercase shadow-black drop-shadow-sm">
                    {currentSprite.title}
                 </h2>
              </div>
          </div>

      </div>

      {/* 2. MIDDLE SECTION: PROGRESS BAR */}
      <div className="px-6 pb-4 relative z-20">
         <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
               {nextSprite ? `${t.bodyProgress}` : t.maxForm}
            </span>
            {nextSprite && (
                <span className="text-xs font-mono text-amber-500">
                   {levelsToGo} Lvls to {nextSprite.title}
                </span>
            )}
         </div>
         <div className="h-3 w-full bg-slate-800 rounded-full border border-slate-700 overflow-hidden relative">
            {/* Glossy Bar */}
            <div 
               className="h-full bg-gradient-to-r from-amber-700 to-amber-500 rounded-full transition-all duration-700 relative"
               style={{ width: `${progressPercent}%` }}
            >
               <div className="absolute inset-0 bg-white/20"></div>
            </div>
         </div>
      </div>

      {/* 3. BOTTOM SECTION: INVENTORY GRID */}
      <div className="flex-1 bg-slate-900/80 border-t border-slate-800 backdrop-blur-md rounded-t-3xl p-4 overflow-hidden flex flex-col z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
         <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-500" /> {t.inventory}
         </h3>
         
         <div className="overflow-y-auto grid grid-cols-4 gap-3 pb-20 pr-1 custom-scrollbar">
            {inventory.map((item) => (
               <button 
                  key={item.id} 
                  onClick={() => onToggleEquip(item)}
                  className={`aspect-square rounded-lg border-2 relative overflow-hidden transition-all active:scale-95 ${
                     item.is_equipped 
                        ? 'border-amber-500 bg-amber-900/20 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                        : 'border-slate-700 bg-slate-800 hover:bg-slate-750'
                  }`}
               >
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  
                  {/* Type Icon Overlay */}
                  <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center">
                     {item.type === 'weapon' && <Sword className="w-2.5 h-2.5 text-red-400" />}
                     {item.type === 'armor' && <Shield className="w-2.5 h-2.5 text-blue-400" />}
                     {item.type === 'accessory' && <Crown className="w-2.5 h-2.5 text-yellow-400" />}
                     {item.type === 'consumable' && <Zap className="w-2.5 h-2.5 text-purple-400" />}
                  </div>

                  {item.is_equipped && (
                     <div className="absolute inset-0 border-2 border-amber-500 rounded-lg flex items-center justify-center bg-black/40">
                        <span className="text-[8px] font-black uppercase text-amber-500 bg-black/80 px-1 rounded transform -rotate-12">
                           {t.equipped}
                        </span>
                     </div>
                  )}
               </button>
            ))}
            
            {/* Empty Slots Filler */}
            {[...Array(Math.max(0, 12 - inventory.length))].map((_, i) => (
               <div key={`empty-${i}`} className="aspect-square rounded-lg border border-slate-800 bg-slate-950/50 flex items-center justify-center opacity-50">
                  <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
};

export default AvatarView;