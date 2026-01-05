
import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Shirt, Sword, Crown, X, ArrowUpRight, Lock } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface Props {
  items: InventoryItem[];
  lang: 'en' | 'ru';
  onToggleEquip?: (item: InventoryItem) => void;
}

const Inventory: React.FC<Props> = ({ items, lang, onToggleEquip }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="p-4 relative">
      <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">{t.equipment}</h3>
      
      <div className="flex flex-col items-center justify-center py-12 text-center opacity-50 border border-slate-800 rounded-xl bg-slate-900/50 mt-4">
          <Lock className="w-12 h-12 mb-3 text-slate-600" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.comingSoon}</h3>
      </div>
    </div>
  );
};

export default Inventory;
