import React, { useState, useRef } from 'react';
import { ClassType, UserProfile, Difficulty, Stats } from '../types';
import { Sword, Activity, Target, ChevronRight, Check, Shield, Skull, Camera, Loader2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { supabase } from '../lib/supabaseClient';

interface Props {
  user: UserProfile;
  lang: 'en' | 'ru';
  onComplete: (data: { gender: 'male' | 'female' | 'other'; height: number; weight: number; class: ClassType; difficulty: Difficulty; stats: Stats; avatar_url?: string }) => void;
}

const OnboardingView: React.FC<Props> = ({ user, lang, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  
  // New Stats State
  const [squat, setSquat] = useState<string>('');
  const [bench, setBench] = useState<string>('');
  const [deadlift, setDeadlift] = useState<string>('');

  const [selectedClass, setSelectedClass] = useState<ClassType>(ClassType.WARRIOR);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.BEGINNER);
  
  // Avatar State
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user.avatar_url);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[lang];

  const localT = {
      strengthStats: lang === 'ru' ? 'Силовые показатели' : 'Strength Stats',
      strengthDesc: lang === 'ru' ? 'Введите ваши 1ПМ (максимум на 1 раз) для расчета программы.' : 'Enter your 1RM (One Rep Max) to calculate training loads.',
      ifUnknown: lang === 'ru' ? 'Если не знаете, введите примерный вес на 5 повторений.' : 'If unknown, enter approximate weight for 5 reps.',
      uploadPhoto: lang === 'ru' ? 'Загрузить фото' : 'Upload Photo',
      chooseGender: lang === 'ru' ? 'Выберите пол' : 'Select Gender'
  };

  const CLASS_DESCRIPTIONS = {
    [ClassType.WARRIOR]: { 
        desc: t.warriorDesc, 
        bonus: "+2 STR",
        icon: Sword,
        color: "text-red-400 bg-red-900/20 border-red-500/50"
    },
    [ClassType.SCOUT]: { 
        desc: t.scoutDesc, 
        bonus: "+2 STA",
        icon: Activity,
        color: "text-green-400 bg-green-900/20 border-green-500/50"
    },
    [ClassType.MONK]: { 
        desc: t.monkDesc, 
        bonus: "+2 WILL",
        icon: Target,
        color: "text-blue-400 bg-blue-900/20 border-blue-500/50"
    },
  };

  const DIFFICULTY_CONFIG = {
    [Difficulty.BEGINNER]: { label: t.beginner, icon: Shield, color: 'text-green-400', border: 'border-green-500' },
    [Difficulty.INTERMEDIATE]: { label: t.intermediate, icon: Sword, color: 'text-amber-400', border: 'border-amber-500' },
    [Difficulty.ADVANCED]: { label: t.advanced, icon: Skull, color: 'text-red-400', border: 'border-red-500' },
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleSubmit = () => {
    onComplete({
      gender,
      height: 175, // Default values since we removed input
      weight: 75,  // Default values since we removed input
      class: selectedClass,
      difficulty: selectedDifficulty,
      stats: {
          squat_1rm: Number(squat) || 0,
          bench_1rm: Number(bench) || 0,
          deadlift_1rm: Number(deadlift) || 0
      },
      avatar_url: avatarUrl
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    setIsUploading(true);

    try {
        const { error: uploadError } = await supabase.storage
            .from('user-avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('user-avatars')
            .getPublicUrl(filePath);

        setAvatarUrl(publicUrl);
    } catch (error: any) {
        console.error('Error uploading avatar:', error);
        alert('Upload failed. Please try again.');
    } finally {
        setIsUploading(false);
    }
  };

  const progressBarWidth = step === 1 ? 'w-1/4' : step === 2 ? 'w-2/4' : step === 3 ? 'w-3/4' : 'w-full';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
           <h1 className="text-3xl font-bold text-white mb-2">{t.charCreation}</h1>
           <p className="text-slate-400">{t.chapter} {step}: {step === 1 ? t.step1 : step === 2 ? localT.strengthStats : step === 3 ? t.step2 : t.step3}</p>
           
           <div className="w-full h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
             <div className={`h-full bg-amber-500 transition-all duration-500 ${progressBarWidth}`}></div>
           </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl">
          
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
               {/* Avatar Upload */}
               <div className="flex flex-col items-center gap-3">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-slate-700 transition-all relative overflow-hidden"
                  >
                     {avatarUrl ? (
                         <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                         <Camera className="w-8 h-8 text-slate-500" />
                     )}
                     {isUploading && (
                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                             <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                         </div>
                     )}
                  </div>
                  <span className="text-xs text-amber-500 font-bold uppercase tracking-wider">{localT.uploadPhoto}</span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                 />
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">{localT.chooseGender}</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['male', 'female', 'other'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g as any)}
                        className={`py-3 rounded-xl border font-bold capitalize transition-all ${
                          gender === g 
                            ? 'bg-amber-600 border-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {g === 'male' ? t.male : g === 'female' ? t.female : t.other}
                      </button>
                    ))}
                  </div>
               </div>

               <button 
                  onClick={handleNext}
                  className="w-full py-4 mt-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
               >
                  {t.nextStep} <ChevronRight className="w-5 h-5" />
               </button>
            </div>
          )}

          {/* STEP 2: STRENGTH STATS */}
          {step === 2 && (
             <div className="space-y-4 animate-in slide-in-from-right duration-300">
                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 mb-2">
                    <p className="text-xs text-slate-400 leading-relaxed text-center">
                        {localT.strengthDesc} <br/>
                        <span className="text-slate-500 italic">{localT.ifUnknown}</span>
                    </p>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.squat} (kg)</label>
                   <div className="relative">
                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">SQ</div>
                       <input 
                          type="number" 
                          value={squat}
                          onChange={(e) => setSquat(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-3 text-white focus:border-amber-500 focus:outline-none font-mono"
                          placeholder="0"
                       />
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.bench} (kg)</label>
                   <div className="relative">
                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">BP</div>
                       <input 
                          type="number" 
                          value={bench}
                          onChange={(e) => setBench(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-3 text-white focus:border-amber-500 focus:outline-none font-mono"
                          placeholder="0"
                       />
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.deadlift} (kg)</label>
                   <div className="relative">
                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">DL</div>
                       <input 
                          type="number" 
                          value={deadlift}
                          onChange={(e) => setDeadlift(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-3 text-white focus:border-amber-500 focus:outline-none font-mono"
                          placeholder="0"
                       />
                   </div>
                </div>

                <button 
                  onClick={handleNext}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-6"
               >
                  {t.nextStep} <ChevronRight className="w-5 h-5" />
               </button>
             </div>
          )}

          {step === 3 && (
             <div className="space-y-4 animate-in slide-in-from-right duration-300">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.selectClass}</label>
                
                {Object.values(ClassType).map((c) => {
                   const info = CLASS_DESCRIPTIONS[c];
                   const Icon = info.icon;
                   const isSelected = selectedClass === c;
                   
                   return (
                      <button
                        key={c}
                        onClick={() => setSelectedClass(c)}
                        className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all relative overflow-hidden ${
                          isSelected 
                            ? `bg-slate-800 border-amber-500 ring-1 ring-amber-500` 
                            : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${info.color}`}>
                            <Icon className="w-6 h-6" />
                         </div>
                         <div className="flex-1 z-10">
                            <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-slate-300'}`}>{c}</h3>
                            <p className="text-xs text-slate-500 leading-tight">{info.desc}</p>
                         </div>
                         {isSelected && (
                            <div className="absolute top-2 right-2 text-amber-500">
                               <Check className="w-5 h-5" />
                            </div>
                         )}
                      </button>
                   );
                })}

                <button 
                  onClick={handleNext}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-6"
               >
                  {t.nextStep} <ChevronRight className="w-5 h-5" />
               </button>
             </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.difficulty}</label>
               
               {Object.values(Difficulty).map((d) => {
                  const config = DIFFICULTY_CONFIG[d];
                  const Icon = config.icon;
                  const isSelected = selectedDifficulty === d;

                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDifficulty(d)}
                      className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${
                        isSelected 
                          ? `bg-slate-800 ${config.border} ring-1 ring-opacity-50` 
                          : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-slate-700 ${isSelected ? config.color : 'text-slate-500'}`}>
                          <Icon className="w-5 h-5" />
                       </div>
                       <div className="flex-1">
                          <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-slate-400'}`}>{config.label}</h3>
                       </div>
                       {isSelected && <Check className={`w-5 h-5 ${config.color}`} />}
                    </button>
                  );
               })}

                <button 
                  onClick={handleSubmit}
                  className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 mt-6"
               >
                  {t.completeSetup}
               </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OnboardingView;