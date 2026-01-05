
import React from 'react';
import { ShopItem } from '../types';
import { ShoppingBag, Coins, Lock } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface Props {
  items: ShopItem[];
  userGold: number;
  userLevel: number;
  lang: 'en' | 'ru';
  onBuy: (item: ShopItem) => void;
}

const ShopView: React.FC<Props> = ({ items, userGold, userLevel = 1, lang, onBuy }) => {
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
          <Lock className="w-16 h-16 mb-4 text-slate-600" />
          <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">{t.comingSoon}</h3>
      </div>
    </div>
  );
};

export default ShopView;
