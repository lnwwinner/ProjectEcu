import React from 'react';

interface SafeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
  riskThreshold?: number;
}

export const SafeSlider: React.FC<SafeSliderProps> = ({ 
  label, 
  value, 
  min, 
  max, 
  unit = '', 
  onChange,
  riskThreshold = 80
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const isHighRisk = percentage > riskThreshold;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-500">{label}</label>
        <span className={`text-xs font-mono font-bold ${isHighRisk ? 'text-red-500' : 'text-zinc-300'}`}>
          {value}{unit}
        </span>
      </div>
      
      <div className="relative h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-100"
        />
        
        {/* Risk Indicator */}
        <div 
          className="absolute bottom-0 left-0 h-0.5 bg-red-500/50 transition-all"
          style={{ 
            left: `${riskThreshold}%`, 
            width: `${100 - riskThreshold}%` 
          }}
        />
      </div>
      
      {isHighRisk && (
        <p className="text-[10px] text-red-500/70 italic">
          Warning: Exceeding safe operational boundaries
        </p>
      )}
    </div>
  );
};
