import React from 'react';
import { WorkoutNode } from '../types';
import { Lock, Check, Swords, Skull } from 'lucide-react';

interface Props {
  nodes: WorkoutNode[];
  onNodeClick: (node: WorkoutNode) => void;
}

const WorkoutMap: React.FC<Props> = ({ nodes, onNodeClick }) => {
  return (
    <div className="flex flex-col items-center py-8 w-full relative">
      <div className="absolute inset-y-0 left-1/2 w-1 bg-slate-800 -translate-x-1/2 z-0"></div>
      
      {nodes.map((node, index) => {
        // Calculate offset for zig-zag pattern
        const isLeft = index % 2 === 0;
        const offsetClass = isLeft ? '-translate-x-12' : 'translate-x-12';

        let StatusIcon = Lock;
        let bgClass = 'bg-slate-800 border-slate-600';
        let textClass = 'text-slate-500';
        let isClickable = false;

        // Flag to identify which node to scroll to (the first available one)
        // If we have completed nodes, the active one is the first 'available'. 
        // If all completed, maybe the last one.
        // We will assign ID 'active-node' to the first node that is 'available'.
        let domId = undefined;

        if (node.status === 'completed') {
          StatusIcon = Check;
          bgClass = 'bg-amber-500 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]';
          textClass = 'text-slate-900';
          isClickable = true; // Can replay
        } else if (node.status === 'available') {
          StatusIcon = node.type === 'boss' ? Skull : Swords;
          bgClass = node.type === 'boss' 
            ? 'bg-red-600 border-red-400 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.6)]' 
            : 'bg-violet-600 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.4)]';
          textClass = 'text-white';
          isClickable = true;
          // Assign ID for scrolling
          // Note: Since map iterates, if multiple are available (unlikely in linear), this might duplicate IDs. 
          // But our logic usually has one active frontier. 
          // To be safe, we can rely on parent checking or just add it here if it's the *last* available or just available.
          domId = 'active-node'; 
        }

        return (
          <div 
            key={node.id}
            id={domId}
            className={`relative z-10 my-6 ${offsetClass} transition-transform duration-300 hover:scale-110`}
          >
            <button
              onClick={() => isClickable && onNodeClick(node)}
              disabled={!isClickable}
              className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${bgClass} cursor-${isClickable ? 'pointer' : 'not-allowed'}`}
            >
              <StatusIcon className={`w-8 h-8 ${textClass}`} />
            </button>
            
            {/* Tooltip/Label */}
            <div className={`absolute top-24 left-1/2 -translate-x-1/2 w-32 text-center`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${node.status === 'available' ? 'text-white' : 'text-slate-500'}`}>
                {node.title}
              </span>
              {node.status === 'available' && (
                <div className="flex justify-center items-center gap-1 text-[10px] text-amber-400 mt-1">
                  <span>+{node.xpReward} XP</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorkoutMap;