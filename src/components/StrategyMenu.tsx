import React from 'react';
import { Truck, Leaf, Flame, Zap, Settings2 } from 'lucide-react';
import { motion } from 'motion/react';

export type TuningStrategy = 'heavy_duty' | 'eco_mode' | 'gasoline' | 'diesel' | 'custom';

interface StrategyMenuProps {
  selected: TuningStrategy;
  onSelect: (strategy: TuningStrategy) => void;
}

const strategies = [
  { id: 'heavy_duty', name: 'Heavy Duty', icon: Truck, desc: 'Optimized for torque and load bearing' },
  { id: 'eco_mode', name: 'Eco Mode', icon: Leaf, desc: 'Maximum fuel efficiency and smoothness' },
  { id: 'gasoline', name: 'Gasoline Performance', icon: Flame, desc: 'Aggressive timing and AFR for petrol' },
  { id: 'diesel', name: 'Diesel Power', icon: Zap, desc: 'Boost and rail pressure optimization' },
  { id: 'custom', name: 'Manual Custom', icon: Settings2, desc: 'Full control over individual map values' },
] as const;

export const StrategyMenu: React.FC<StrategyMenuProps> = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {strategies.map((strategy) => {
        const Icon = strategy.icon;
        const isActive = selected === strategy.id;

        return (
          <motion.button
            key={strategy.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(strategy.id)}
            className={`
              flex flex-col items-start p-4 rounded-xl border transition-all text-left
              ${isActive 
                ? 'bg-zinc-100 border-zinc-900 text-zinc-900 shadow-lg' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}
            `}
          >
            <Icon className={`w-6 h-6 mb-3 ${isActive ? 'text-zinc-900' : 'text-zinc-500'}`} />
            <h3 className="font-semibold text-sm mb-1">{strategy.name}</h3>
            <p className={`text-[10px] leading-tight ${isActive ? 'text-zinc-600' : 'text-zinc-500'}`}>
              {strategy.desc}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
};
