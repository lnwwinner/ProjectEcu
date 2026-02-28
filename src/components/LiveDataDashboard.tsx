import React, { useEffect, useState } from 'react';
import { Activity, Thermometer, Gauge, Wind, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { ecuLiveStream, LiveECUData } from '../services/ecuWebSocket';

export const LiveDataDashboard: React.FC = () => {
  const [liveData, setLiveData] = useState<LiveECUData | null>(null);
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');

  useEffect(() => {
    ecuLiveStream.onStatusChange(setStatus);
    ecuLiveStream.onData(setLiveData);
    ecuLiveStream.connect();

    return () => {
      ecuLiveStream.disconnect();
    };
  }, []);

  if (!liveData) {
    return (
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center h-48">
        <Activity className="w-8 h-8 text-zinc-600 mb-3 animate-pulse" />
        <p className="text-xs font-mono text-zinc-500 uppercase">Waiting for ECU Telemetry...</p>
        <p className="text-[10px] text-zinc-600 mt-1">Status: {status}</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Live Telemetry</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] font-mono text-zinc-500 uppercase">{status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* RPM */}
        <div className="bg-black/40 rounded-xl p-4 border border-zinc-800/50 flex flex-col items-center justify-center relative overflow-hidden">
          <Gauge className="w-5 h-5 text-zinc-500 mb-2" />
          <span className="text-2xl font-bold font-mono text-zinc-100">{liveData.rpm}</span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase mt-1">RPM</span>
          
          {/* RPM Bar */}
          <div className="absolute bottom-0 left-0 h-1 bg-zinc-800 w-full">
            <motion.div 
              className={`h-full ${liveData.rpm > 6000 ? 'bg-red-500' : 'bg-emerald-500'}`}
              animate={{ width: `${(liveData.rpm / 7000) * 100}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
            />
          </div>
        </div>

        {/* Boost */}
        <div className="bg-black/40 rounded-xl p-4 border border-zinc-800/50 flex flex-col items-center justify-center relative overflow-hidden">
          <Wind className="w-5 h-5 text-zinc-500 mb-2" />
          <span className="text-2xl font-bold font-mono text-zinc-100">{liveData.boostPressure.toFixed(2)}</span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase mt-1">Boost (Bar)</span>
          
          <div className="absolute bottom-0 left-0 h-1 bg-zinc-800 w-full">
            <motion.div 
              className={`h-full ${liveData.boostPressure > 1.8 ? 'bg-amber-500' : 'bg-blue-500'}`}
              animate={{ width: `${(liveData.boostPressure / 2.5) * 100}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
            />
          </div>
        </div>

        {/* AFR */}
        <div className="bg-black/40 rounded-xl p-4 border border-zinc-800/50 flex flex-col items-center justify-center relative overflow-hidden">
          <Zap className="w-5 h-5 text-zinc-500 mb-2" />
          <span className="text-2xl font-bold font-mono text-zinc-100">{liveData.afr.toFixed(1)}</span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase mt-1">AFR</span>
          
          <div className="absolute bottom-0 left-0 h-1 bg-zinc-800 w-full">
            <motion.div 
              className={`h-full ${liveData.afr < 12.5 ? 'bg-amber-500' : liveData.afr > 14.7 ? 'bg-red-500' : 'bg-emerald-500'}`}
              animate={{ width: `${(liveData.afr / 18) * 100}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
            />
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-black/40 rounded-xl p-4 border border-zinc-800/50 flex flex-col items-center justify-center relative overflow-hidden">
          <Thermometer className="w-5 h-5 text-zinc-500 mb-2" />
          <span className="text-2xl font-bold font-mono text-zinc-100">{liveData.temperature}°</span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase mt-1">Coolant (C)</span>
          
          <div className="absolute bottom-0 left-0 h-1 bg-zinc-800 w-full">
            <motion.div 
              className={`h-full ${liveData.temperature > 100 ? 'bg-red-500' : 'bg-orange-500'}`}
              animate={{ width: `${(liveData.temperature / 120) * 100}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
            />
          </div>
        </div>

        {/* Engine Load */}
        <div className="bg-black/40 rounded-xl p-4 border border-zinc-800/50 flex flex-col items-center justify-center relative overflow-hidden">
          <Activity className="w-5 h-5 text-zinc-500 mb-2" />
          <span className="text-2xl font-bold font-mono text-zinc-100">{liveData.load}%</span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase mt-1">Engine Load</span>
          
          <div className="absolute bottom-0 left-0 h-1 bg-zinc-800 w-full">
            <motion.div 
              className="h-full bg-purple-500"
              animate={{ width: `${liveData.load}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
