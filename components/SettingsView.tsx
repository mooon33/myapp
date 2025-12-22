import React from 'react';
import { Settings, Volume2, Bell, Shield, LogOut, ChevronRight, Globe, Moon, Sun, VolumeX, BellOff } from 'lucide-react';
import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onLogout: () => void;
}

const SettingsView: React.FC<Props> = ({ settings, onUpdateSettings, onLogout }) => {
  
  const toggleSound = () => onUpdateSettings({ soundEnabled: !settings.soundEnabled });
  const toggleNotif = () => onUpdateSettings({ notificationsEnabled: !settings.notificationsEnabled });
  const toggleTheme = () => onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  
  const cycleLanguage = () => {
    const langs: AppSettings['language'][] = ['en', 'ru', 'es'];
    const currentIndex = langs.indexOf(settings.language);
    const nextIndex = (currentIndex + 1) % langs.length;
    onUpdateSettings({ language: langs[nextIndex] });
  };

  const getLangLabel = (code: string) => {
    if (code === 'ru') return 'Русский';
    if (code === 'es') return 'Español';
    return 'English';
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="p-4 bg-slate-900 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" /> Settings
        </h2>
      </div>

      <div className="p-4 space-y-6">
         {/* GENERAL */}
         <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">General</h3>
            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
               
               {/* Sound */}
               <button 
                onClick={toggleSound}
                className="w-full flex justify-between items-center p-4 hover:bg-slate-800 transition-colors border-b border-slate-800"
               >
                  <div className="flex items-center gap-3">
                     {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-slate-400" /> : <VolumeX className="w-5 h-5 text-slate-600" />}
                     <span className={settings.soundEnabled ? "text-slate-200" : "text-slate-500"}>Sound Effects</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${settings.soundEnabled ? 'bg-green-600' : 'bg-slate-700'}`}>
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.soundEnabled ? 'right-1' : 'left-1'}`}></div>
                  </div>
               </button>

               {/* Notifications */}
               <button 
                onClick={toggleNotif}
                className="w-full flex justify-between items-center p-4 hover:bg-slate-800 transition-colors border-b border-slate-800"
               >
                  <div className="flex items-center gap-3">
                     {settings.notificationsEnabled ? <Bell className="w-5 h-5 text-slate-400" /> : <BellOff className="w-5 h-5 text-slate-600" />}
                     <span className={settings.notificationsEnabled ? "text-slate-200" : "text-slate-500"}>Notifications</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${settings.notificationsEnabled ? 'bg-slate-600' : 'bg-slate-800'}`}>
                     <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${settings.notificationsEnabled ? 'right-1 bg-white' : 'left-1 bg-slate-500'}`}></div>
                  </div>
               </button>

               {/* Language */}
               <button 
                 onClick={cycleLanguage}
                 className="w-full flex justify-between items-center p-4 hover:bg-slate-800 transition-colors border-b border-slate-800"
               >
                  <div className="flex items-center gap-3">
                     <Globe className="w-5 h-5 text-slate-400" />
                     <span className="text-slate-200">Language</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                     <span className="text-sm font-bold">{getLangLabel(settings.language)}</span>
                     <ChevronRight className="w-4 h-4" />
                  </div>
               </button>

                {/* Theme */}
                <button 
                 onClick={toggleTheme}
                 className="w-full flex justify-between items-center p-4 hover:bg-slate-800 transition-colors"
               >
                  <div className="flex items-center gap-3">
                     {settings.theme === 'dark' ? <Moon className="w-5 h-5 text-slate-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
                     <span className="text-slate-200">Theme</span>
                  </div>
                  <span className="text-xs font-bold uppercase text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    {settings.theme}
                  </span>
               </button>

            </div>
         </div>

         {/* ACCOUNT */}
         <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account</h3>
             <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
               <button className="w-full flex justify-between items-center p-4 hover:bg-slate-800 transition-colors border-b border-slate-800">
                  <div className="flex items-center gap-3">
                     <Shield className="w-5 h-5 text-slate-400" />
                     <span className="text-slate-200">Privacy Policy</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600" />
               </button>
               <button 
                onClick={onLogout}
                className="w-full flex justify-between items-center p-4 hover:bg-slate-800 transition-colors text-red-400"
               >
                  <div className="flex items-center gap-3">
                     <LogOut className="w-5 h-5" />
                     <span>Log Out</span>
                  </div>
               </button>
            </div>
         </div>
         
         <div className="text-center text-xs text-slate-600 font-mono mt-8">
            IronQuest v0.9.3 Beta
         </div>
      </div>
    </div>
  );
};

export default SettingsView;