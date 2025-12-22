import React, { useState } from 'react';
import { ClassType, UserProfile, Difficulty } from '../types';
import { Ruler, Weight as WeightIcon, Sword, Activity, Target, ChevronRight, Check, Zap, Skull, Shield } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface Props {
  user: UserProfile;
  lang: 'en' | 'ru';
  onComplete: (data: { gender: 'male' | 'female' | 'other'; height: number; weight: number; class: ClassType; difficulty: Difficulty }) => void;
}

const OnboardingView: React.FC<Props> = ({ user, lang, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<ClassType>(ClassType.WARRIOR);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.BEGINNER);

  const t = TRANSLATIONS[lang];

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
    if (step === 1 && height && weight) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = () => {
    onComplete({
      gender,
      height: Number(height),
      weight: Number(weight),
      class: selectedClass,
      difficulty: selectedDifficulty
    });
  };

  const progressBarWidth = step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
           <h1 className="text-3xl font-bold text-white mb-2">{t.charCreation}</h1>
           <p className="text-slate-400">{t.chapter} {step}: {step === 1 ? t.step1 : step === 2 ? t.step2 : t.step3}</p>
           
           <div className="w-full h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
             <div className={`h-full bg-amber-500 transition-all duration-500 ${progressBarWidth}`}></div>
           </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl">
          
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.gender}</label>
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

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.height}</label>
                    <div className="relative">
                       <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                       <input 
                          type="number" 
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-3 text-white focus:border-amber-500 focus:outline-none"
                          placeholder="175"
                       />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.weight}</label>
                    <div className="relative">
                       <WeightIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                       <input 
                          type="number" 
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-3 text-white focus:border-amber-500 focus:outline-none"
                          placeholder="70"
                       />
                    </div>
                  </div>
               </div>

               <button 
                  onClick={handleNext}
                  disabled={!height || !weight}
                  className="w-full py-4 mt-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {t.nextStep} <ChevronRight className="w-5 h-5" />
               </button>
            </div>
          )}

          {step === 2 && (
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

          {step === 3 && (
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