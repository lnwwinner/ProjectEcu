import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Activity, 
  ShieldCheck, 
  BarChart3, 
  History, 
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { StrategyMenu, TuningStrategy } from './components/StrategyMenu';
import { SafeSlider } from './components/SafeSlider';
import { LiveDataDashboard } from './components/LiveDataDashboard';
import { analyzeECUFile, ECUAnalysis } from './services/geminiService';

export default function App() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ECUAnalysis | null>(null);
  const [strategy, setStrategy] = useState<TuningStrategy>('eco_mode');
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; tempPath: string } | null>(null);

  // Manual Tuning State
  const [boost, setBoost] = useState(1.2);
  const [fuel, setFuel] = useState(14.7);
  const [timing, setTiming] = useState(5);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadSuccess(false);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('ecu_file', file);

    try {
      const response = await fetch('/api/upload-ecu', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setFileInfo({ name: data.filename, size: data.size, tempPath: data.tempPath });
      setUploadSuccess(true);

      // Trigger AI Analysis
      const aiResult = await analyzeECUFile(data.filename, data.sample);
      setAnalysis(aiResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans selection:bg-zinc-100 selection:text-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-zinc-900" />
            </div>
            <h1 className="font-bold tracking-tight text-lg">ECU TUNING <span className="text-zinc-500 font-medium">WORKSPACE</span></h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-widest text-zinc-500">
            <a href="#" className="hover:text-zinc-100 transition-colors">Dashboard</a>
            <a href="#" className="hover:text-zinc-100 transition-colors">Map Editor</a>
            <a href="#" className="hover:text-zinc-100 transition-colors">Diagnostics</a>
            <a href="#" className="hover:text-zinc-100 transition-colors">History</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase">System Online</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upload & Analysis */}
          <div className="lg:col-span-4 space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-zinc-500" />
                <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Binary Input</h2>
              </div>
              <FileUpload 
                onUpload={handleUpload} 
                isUploading={isUploading} 
                error={error} 
                success={uploadSuccess} 
              />
            </section>

            <AnimatePresence>
              {analysis && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500">AI Analysis</h2>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${analysis.fileStatus === 'Original' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {analysis.fileStatus}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Target ECU / Vehicle</p>
                      <p className="text-lg font-semibold">{analysis.brand} {analysis.model}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-black/30 rounded-xl border border-zinc-800/50">
                        <p className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Tuning Level</p>
                        <p className="text-xl font-bold">{analysis.tuningLevel}%</p>
                      </div>
                      <div className="p-3 bg-black/30 rounded-xl border border-zinc-800/50">
                        <p className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Efficiency</p>
                        <p className="text-xl font-bold">{analysis.performanceScore}%</p>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
                      <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-zinc-500 mt-0.5" />
                        <p className="text-xs text-zinc-400 leading-relaxed italic">
                          "{analysis.summary}"
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Strategies & Tuning */}
          <div className="lg:col-span-8 space-y-8">
            <LiveDataDashboard />

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-zinc-500" />
                <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Optimization Strategy</h2>
              </div>
              <StrategyMenu selected={strategy} onSelect={setStrategy} />
            </section>

            <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-zinc-500" />
                  <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Parameter Adjustment</h2>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 uppercase">
                  <span>Safety Lock: <span className="text-emerald-500">Active</span></span>
                  <span>Real-time Sync: <span className="text-emerald-500">ON</span></span>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <SafeSlider 
                    label="Boost Pressure" 
                    value={boost} 
                    min={0.5} 
                    max={2.5} 
                    unit=" bar" 
                    onChange={setBoost} 
                    riskThreshold={70}
                  />
                  <SafeSlider 
                    label="Target AFR" 
                    value={fuel} 
                    min={10} 
                    max={16} 
                    unit=":1" 
                    onChange={setFuel} 
                    riskThreshold={85}
                  />
                  <SafeSlider 
                    label="Ignition Timing" 
                    value={timing} 
                    min={-10} 
                    max={25} 
                    unit="°" 
                    onChange={setTiming} 
                    riskThreshold={60}
                  />
                </div>

                <div className="bg-black/40 rounded-2xl p-6 border border-zinc-800/50 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <History className="w-4 h-4 text-zinc-500" />
                      Live Impact Simulation
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-zinc-500">HP Gain (Est.)</span>
                        <span className="text-lg font-bold text-emerald-500">+{Math.round((boost - 1.2) * 50 + (timing - 5) * 2)} HP</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-emerald-500" 
                          animate={{ width: `${Math.min(100, (boost / 2.5) * 100)}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-zinc-500">EGT Risk</span>
                        <span className={`text-lg font-bold ${fuel < 12 ? 'text-amber-500' : 'text-zinc-300'}`}>
                          {fuel < 12 ? 'Elevated' : 'Normal'}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${fuel < 12 ? 'bg-amber-500' : 'bg-zinc-500'}`} 
                          animate={{ width: `${(16 - fuel) / 6 * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-4 bg-zinc-100 text-zinc-900 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2 mt-8">
                    Write to ECU
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-zinc-900 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            © 2026 ECU Tuning Workspace // Production Grade Engine v4.2.0
          </div>
          <div className="flex gap-8 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            <a href="#" className="hover:text-zinc-400">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-400">Terms of Service</a>
            <a href="#" className="hover:text-zinc-400">API Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
