import React, { useState } from 'react';
import { Settings, Volume2, Bell, Shield, LogOut, ChevronRight, Globe, VolumeX, BellOff, X, Check } from 'lucide-react';
import { AppSettings } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onLogout: () => void;
}

const SettingsView: React.FC<Props> = ({ settings, onUpdateSettings, onLogout }) => {
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  
  const toggleSound = () => onUpdateSettings({ soundEnabled: !settings.soundEnabled });
  const toggleNotif = () => onUpdateSettings({ notificationsEnabled: !settings.notificationsEnabled });
  
  const t = TRANSLATIONS[settings.language];

  const getLangLabel = (code: string) => {
    if (code === 'ru') return t.russian;
    return t.english;
  };

  const selectLanguage = (lang: 'en' | 'ru') => {
    onUpdateSettings({ language: lang });
    setIsLangModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 relative">
      <div className="p-4 border-b bg-slate-900 border-slate-800">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
          <Settings className="w-6 h-6 text-slate-400" /> {t.settings}
        </h2>
      </div>

      <div className="p-4 space-y-6">
         {/* GENERAL */}
         <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.general}</h3>
            <div className="rounded-xl overflow-hidden border bg-slate-900 border-slate-800">
               
               {/* Sound */}
               <button 
                onClick={toggleSound}
                className="w-full flex justify-between items-center p-4 transition-colors border-b hover:bg-slate-800 border-slate-800"
               >
                  <div className="flex items-center gap-3">
                     {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-slate-400" /> : <VolumeX className="w-5 h-5 text-slate-600" />}
                     <span className="text-slate-200">{t.sound}</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${settings.soundEnabled ? 'bg-green-600' : 'bg-slate-700'}`}>
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.soundEnabled ? 'right-1' : 'left-1'}`}></div>
                  </div>
               </button>

               {/* Notifications */}
               <button 
                onClick={toggleNotif}
                className="w-full flex justify-between items-center p-4 transition-colors border-b hover:bg-slate-800 border-slate-800"
               >
                  <div className="flex items-center gap-3">
                     {settings.notificationsEnabled ? <Bell className="w-5 h-5 text-slate-400" /> : <BellOff className="w-5 h-5 text-slate-600" />}
                     <span className="text-slate-200">{t.notifications}</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${settings.notificationsEnabled ? 'bg-green-600' : 'bg-slate-800'}`}>
                     <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${settings.notificationsEnabled ? 'right-1 bg-white' : 'left-1 bg-slate-500'}`}></div>
                  </div>
               </button>

               {/* Language */}
               <button 
                 onClick={() => setIsLangModalOpen(true)}
                 className="w-full flex justify-between items-center p-4 transition-colors hover:bg-slate-800"
               >
                  <div className="flex items-center gap-3">
                     <Globe className="w-5 h-5 text-slate-400" />
                     <span className="text-slate-200">{t.language}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                     <span className="text-sm font-bold">{getLangLabel(settings.language)}</span>
                     <ChevronRight className="w-4 h-4" />
                  </div>
               </button>

            </div>
         </div>

         {/* ACCOUNT */}
         <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.account}</h3>
             <div className="rounded-xl overflow-hidden border bg-slate-900 border-slate-800">
               <button className="w-full flex justify-between items-center p-4 transition-colors border-b hover:bg-slate-800 border-slate-800">
                  <div className="flex items-center gap-3">
                     <Shield className="w-5 h-5 text-slate-400" />
                     <span className="text-slate-200">{t.privacy}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600" />
               </button>
               <button 
                onClick={onLogout}
                className="w-full flex justify-between items-center p-4 transition-colors text-red-400 hover:bg-slate-800"
               >
                  <div className="flex items-center gap-3">
                     <LogOut className="w-5 h-5" />
                     <span>{t.logout}</span>
                  </div>
               </button>
            </div>
         </div>
         
         <div className="text-center text-xs text-slate-600 font-mono mt-8">
            IronQuest v0.9.4 Beta
         </div>
      </div>

      {/* LANGUAGE MODAL */}
      {isLangModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-slate-900 border border-slate-700 text-white">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{t.selectLanguage}</h3>
                <button onClick={() => setIsLangModalOpen(false)} className="text-slate-400 hover:text-inherit">
                   <X className="w-6 h-6" />
                </button>
             </div>
             
             <div className="space-y-3">
                <button 
                  onClick={() => selectLanguage('en')}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                    settings.language === 'en' 
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold' 
                      : 'border-slate-700 bg-slate-800'
                  }`}
                >
                   <span className="flex items-center gap-3">
                      <span className="text-2xl">🇺🇸</span> English
                   </span>
                   {settings.language === 'en' && <Check className="w-5 h-5" />}
                </button>

                <button 
                  onClick={() => selectLanguage('ru')}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                    settings.language === 'ru' 
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold' 
                      : 'border-slate-700 bg-slate-800'
                  }`}
                >
                   <span className="flex items-center gap-3">
                      <span className="text-2xl">🇷🇺</span> Русский
                   </span>
                   {settings.language === 'ru' && <Check className="w-5 h-5" />}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;