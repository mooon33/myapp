import React from 'react';
import { ShopItem } from '../types';
import { ShoppingBag, Shield, Zap, Sword, Crown, Coins, Lock } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface Props {
  items: ShopItem[];
  userGold: number;
  userLevel: number;
  lang: 'en' | 'ru';
  onBuy: (item: ShopItem) => void;
}

const ShopView: React.FC<Props> = ({ items, userGold, userLevel = 1, lang, onBuy }) => {
  const tiers = (Array.from(new Set(items.map(i => i.minLevel))) as number[]).sort((a, b) => a - b);
  const t = TRANSLATIONS[lang];

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-emerald-500" /> {t.merchant}
        </h2>
        <div className="bg-slate-950 border border-amber-500/50 rounded-full px-4 py-1 flex items-center gap-2">
           <Coins className="w-4 h-4 text-amber-500" />
           <span className="font-mono text-amber-400 font-bold">{userGold}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
         
         {tiers.map(tierLevel => {
            const tierItems = items.filter(i => i.minLevel === tierLevel);
            const isTierLocked = userLevel < tierLevel;

            return (
              <div key={tierLevel}>
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    {tierLevel === 1 ? t.noviceGear : `${t.tier} ${Math.ceil(tierLevel/5)} (${t.lvl} ${tierLevel}+)`}
                    {isTierLocked && <Lock className="w-3 h-3 text-red-500" />}
                 </h3>
                 <div className="grid grid-cols-1 gap-4">
                    {tierItems.map(item => {
                       const canAfford = userGold >= item.price;
                       let Icon = Sword;
                       if (item.type === 'armor') Icon = Shield;
                       if (item.type === 'accessory') Icon = Crown;
                       if (item.type === 'consumable') Icon = Zap;

                       let rarityColor = 'border-slate-700';
                       if (item.rarity === 'rare') rarityColor = 'border-blue-500/50';
                       if (item.rarity === 'epic') rarityColor = 'border-purple-500/50';
                       if (item.rarity === 'legendary') rarityColor = 'border-yellow-500/50';

                       return (
                          <div key={item.id} className={`bg-slate-900 border ${rarityColor} rounded-xl p-4 flex gap-4 transition-all hover:bg-slate-800 relative overflow-hidden`}>
                             {isTierLocked && (
                                <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                                   <div className="bg-red-900/80 text-red-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-red-500/30">
                                      <Lock className="w-3 h-3" /> {t.requiresLvl} {tierLevel}
                                   </div>
                                </div>
                             )}

                             <div className="w-20 h-20 bg-slate-950 rounded-lg shrink-0 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                   <Icon className="w-8 h-8 text-white drop-shadow-md" />
                                </div>
                             </div>
                             
                             <div className="flex-1 flex flex-col justify-between">
                                <div>
                                   <div className="flex justify-between items-start">
                                      <h3 className="font-bold text-slate-100">{item.name}</h3>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold ${
                                         item.rarity === 'common' ? 'border-slate-600 text-slate-500' :
                                         item.rarity === 'rare' ? 'border-blue-600 text-blue-500' :
                                         item.rarity === 'epic' ? 'border-purple-600 text-purple-500' :
                                         'border-yellow-600 text-yellow-500'
                                      }`}>
                                         {item.rarity}
                                      </span>
                                   </div>
                                   <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                                   {item.statBonus && (
                                      <div className="flex gap-2 mt-2">
                                         {Object.entries(item.statBonus).map(([stat, val]) => (
                                            <span key={stat} className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400 font-mono">
                                               +{val} {stat.toUpperCase()}
                                            </span>
                                         ))}
                                      </div>
                                   )}
                                </div>
                                
                                <div className="flex justify-end mt-3">
                                   <button
                                      onClick={() => onBuy(item)}
                                      disabled={!canAfford || isTierLocked}
                                      className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1 transition-colors ${
                                         canAfford && !isTierLocked
                                            ? 'bg-amber-600 text-slate-950 hover:bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                      }`}
                                   >
                                      {isTierLocked ? t.locked : canAfford ? t.buy : t.tooExpensive}
                                      <span className="flex items-center gap-0.5 ml-1">
                                         {item.price} <Coins className="w-3 h-3" />
                                      </span>
                                   </button>
                                </div>
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </div>
            );
         })}
         
      </div>
    </div>
  );
};

export default ShopView;