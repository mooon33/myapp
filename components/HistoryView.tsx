
import React, { useEffect, useState } from 'react';
import { WorkoutLog, UserProfile, Exercise } from '../types';
import { Scroll, Clock, Trophy, Coins, Calendar, Loader2, ChevronRight, X, Dumbbell } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { supabase } from '../lib/supabaseClient';

interface Props {
    user: UserProfile;
    lang: 'en' | 'ru';
}

const HistoryView: React.FC<Props> = ({ user, lang }) => {
    const [logs, setLogs] = useState<WorkoutLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);
    const t = TRANSLATIONS[lang];

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch from Supabase
                const { data, error } = await supabase
                    .from('workout_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('completed_at', { ascending: false });

                if (!error && data) {
                    setLogs(data);
                } else {
                    setLogs([]);
                }
            } catch (e) {
                console.error("History fetch error", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [user.id]);

    return (
        <div className="flex flex-col h-full bg-slate-950 relative">
            <div className="p-4 bg-slate-900 border-b border-slate-800">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Scroll className="w-6 h-6 text-amber-500" /> {t.history}
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p>{t.loading}</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
                         <Scroll className="w-16 h-16 mb-4" />
                         <p className="text-sm uppercase font-bold">{t.noHistory}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-xs font-bold text-slate-500 uppercase px-1">
                            {t.totalWorkouts}: <span className="text-white">{logs.length}</span>
                        </div>
                        {logs.map((log) => (
                            <div 
                                key={log.id} 
                                onClick={() => setSelectedLog(log)}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 cursor-pointer hover:border-slate-600 transition-colors group"
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-slate-100 text-lg group-hover:text-white">{log.workout_title}</h3>
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(log.completed_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex gap-4">
                                        <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
                                            <Trophy className="w-3 h-3 text-violet-400" />
                                            <span className="text-xs font-mono text-violet-200">+{log.xp_earned} XP</span>
                                        </div>
                                        <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
                                            <Coins className="w-3 h-3 text-amber-400" />
                                            <span className="text-xs font-mono text-amber-200">+{log.gold_earned} G</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* DETAIL MODAL */}
            {selectedLog && (
                <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col animate-in slide-in-from-right duration-200">
                    <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">{t.workoutDetails}</h2>
                        <button onClick={() => setSelectedLog(null)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6">
                        <h3 className="text-2xl font-black text-amber-500 mb-2">{selectedLog.workout_title}</h3>
                        <p className="text-slate-500 text-sm mb-6 flex items-center gap-2">
                             <Calendar className="w-4 h-4" />
                             {new Date(selectedLog.completed_at).toLocaleString()}
                        </p>

                        <div className="space-y-4">
                            {selectedLog.exercises && selectedLog.exercises.length > 0 ? (
                                selectedLog.exercises.map((ex, i) => (
                                    <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-slate-800 rounded-full border border-slate-700">
                                                <Dumbbell className="w-5 h-5 text-slate-300" />
                                            </div>
                                            <h4 className="font-bold text-white text-lg">{ex.name}</h4>
                                        </div>
                                        <div className="pl-12 text-sm text-slate-400 font-mono">
                                            <span className="text-white">{ex.sets}</span> sets × <span className="text-white">{ex.reps}</span> reps
                                            {ex.weight ? <span className="ml-2 text-amber-500 font-bold">@ {ex.weight}kg</span> : ''}
                                            {ex.percent1rm && <span className="ml-2 text-blue-400">({ex.percent1rm * 100}% 1RM)</span>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-slate-500 italic py-10">
                                    Details not available for this log.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryView;
