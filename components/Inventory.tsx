import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Shirt, Sword, Crown, X, ArrowUpRight } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface Props {
  items: InventoryItem[];
  lang: 'en' | 'ru';
  onToggleEquip?: (item: InventoryItem) => void;
}

const Inventory: React.FC<Props> = ({ items, lang, onToggleEquip }) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const t = TRANSLATIONS[lang];

  return (
    <div className="p-4 relative">
      <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">{t.equipment}</h3>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => {
          let Icon = Sword;
          if (item.type === 'armor') Icon = Shirt;
          if (item.type === 'accessory') Icon = Crown;

          let rarityColor = 'border-slate-600';
          if (item.rarity === 'rare') rarityColor = 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
          if (item.rarity === 'epic') rarityColor = 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
          if (item.rarity === 'legendary') rarityColor = 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]';

          return (
            <div 
              key={item.id} 
              onClick={() => setSelectedItem(item)}
              className={`aspect-square bg-slate-900 border-2 ${rarityColor} rounded-lg relative group overflow-hidden cursor-pointer transition-transform hover:scale-105`}
            >
               {/* Item Image Placeholder */}
               <img src={item.image_url} alt={item.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
               
               {/* Overlay Info */}
               <div className="absolute inset-0 flex flex-col items-center justify-center p-1 bg-black/40">
                  {item.is_equipped && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,1)]"></div>
                  )}
                  <Icon className="w-6 h-6 text-white mb-1 drop-shadow-md" />
               </div>
               
               {/* Name on hover (desktop) or touch */}
               <div className="absolute bottom-0 inset-x-0 bg-slate-900/90 p-1 text-[9px] text-center font-bold text-slate-300 truncate">
                {item.name}
               </div>
            </div>
          );
        })}
        {/* Empty Slots */}
        {[...Array(6)].map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square bg-slate-900/50 border border-slate-800 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedItem(null)}>
           <div className="bg-slate-900 border border-slate-600 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center mb-6">
                 <div className={`w-24 h-24 rounded-xl border-4 ${
                    selectedItem.rarity === 'legendary' ? 'border-yellow-500' : 
                    selectedItem.rarity === 'epic' ? 'border-purple-500' :
                    selectedItem.rarity === 'rare' ? 'border-blue-500' : 'border-slate-600'
                 } bg-slate-800 mb-4 overflow-hidden relative shadow-lg`}>
                    <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-full object-cover" />
                 </div>
                 <h2 className="text-xl font-bold text-white text-center mb-1">{selectedItem.name}</h2>
                 <div className="flex gap-2">
                    <span className="text-xs uppercase font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{selectedItem.type}</span>
                    <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded border ${
                       selectedItem.rarity === 'legendary' ? 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10' :
                       selectedItem.rarity === 'epic' ? 'text-purple-500 border-purple-500/50 bg-purple-500/10' :
                       selectedItem.rarity === 'rare' ? 'text-blue-500 border-blue-500/50 bg-blue-500/10' :
                       'text-slate-400 border-slate-600 bg-slate-800'
                    }`}>{selectedItem.rarity}</span>
                 </div>
              </div>

              {selectedItem.statBonus && (
                 <div className="bg-slate-800 rounded-lg p-3 mb-6 flex justify-center gap-4">
                    {Object.entries(selectedItem.statBonus).map(([stat, val]) => (
                       <div key={stat} className="text-center">
                          <div className="text-[10px] uppercase font-bold text-slate-500">{stat}</div>
                          <div className="text-lg font-bold text-emerald-400">+{val}</div>
                       </div>
                    ))}
                 </div>
              )}

              {onToggleEquip && (
                 <button 
                   onClick={() => {
                      onToggleEquip(selectedItem);
                      setSelectedItem(null);
                   }}
                   className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                      selectedItem.is_equipped 
                         ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                         : 'bg-amber-600 text-slate-900 hover:bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                   }`}
                 >
                    {selectedItem.is_equipped ? t.unequip : t.equip}
                    {!selectedItem.is_equipped && <ArrowUpRight className="w-4 h-4" />}
                 </button>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;