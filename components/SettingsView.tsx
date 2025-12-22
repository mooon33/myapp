import React from 'react';
import { Settings, Volume2, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';

const SettingsView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="p-4 bg-slate-900 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" /> Settings
        </h2>
      </div>

      <div className="p-4 space-y-6">
         <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">General</h3>
            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
               <button className="w-full flex justify-between items-center p-4 hover:bg-slate-800 transition-colors border-b border-slate-800">
                  <div className="flex items-center gap-3">
                     <Volume2 className="w-5 h-5 text-slate-400" />
                     <span className="text-slate-200">Sound Effects</span>
                  </div>
                  <div className="w-10 h-6 bg-green-600 rounded-full relative">
                     <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
               </button>
               <button className="w-full flex justify-between items-center p-4 hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                     <Bell className="w-5 h-5 text-slate-400" />
                     <span className="text-slate-200">Notifications</span>
                  </div>
                  <div className="w-10 h-6 bg-slate-700 rounded-full relative">
                     <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full"></div>
                  </div>
               </button>
            </div>
         </div>

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
               <button className="w-full flex justify-between items-center p-4 hover:bg-slate-800 transition-colors text-red-400">
                  <div className="flex items-center gap-3">
                     <LogOut className="w-5 h-5" />
                     <span>Log Out</span>
                  </div>
               </button>
            </div>
         </div>
         
         <div className="text-center text-xs text-slate-600 font-mono mt-8">
            IronQuest v0.9.2 Beta
         </div>
      </div>
    </div>
  );
};

export default SettingsView;