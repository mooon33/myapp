import React from 'react';
import { InventoryItem } from '../types';
import { Shirt, Sword, Crown } from 'lucide-react';

interface Props {
  items: InventoryItem[];
}

const Inventory: React.FC<Props> = ({ items }) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">Equipment</h3>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => {
          let Icon = Sword;
          if (item.type === 'armor') Icon = Shirt;
          if (item.type === 'accessory') Icon = Crown;

          let rarityColor = 'border-slate-600';
          if (item.rarity === 'rare') rarityColor = 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
          if (item.rarity === 'epic') rarityColor = 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)]';

          return (
            <div key={item.id} className={`aspect-square bg-slate-900 border-2 ${rarityColor} rounded-lg relative group overflow-hidden`}>
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
    </div>
  );
};

export default Inventory;