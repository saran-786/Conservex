import React, { useState, useEffect } from 'react';
import { Flame, Calendar, Users, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { AppData, LPGData } from '../types';

interface LPGProps {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

export default function LPG({ data, onUpdate }: LPGProps) {
  const [refillDate, setRefillDate] = useState(data.lpg.lastRefill);
  const [usageLevel, setUsageLevel] = useState(data.lpg.usageLevel);

  useEffect(() => {
    setRefillDate(data.lpg.lastRefill);
    setUsageLevel(data.lpg.usageLevel);
  }, [data.lpg.lastRefill, data.lpg.usageLevel]);

  const calculateDaysFor = (date: string, level: string, members: number) => {
    const start = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let expectedDuration = 30;
    if (level === 'High') expectedDuration -= 7;
    if (level === 'Low') expectedDuration += 9;
    if (members > 4) expectedDuration -= Math.min(10, (members - 4) * 2);

    const remaining = expectedDuration - diffDays;
    return {
      used: diffDays,
      remaining: Math.max(0, remaining),
      percent: Math.min(100, Math.max(0, (remaining / expectedDuration) * 100))
    };
  };

  const currentStatus = calculateDaysFor(refillDate, usageLevel, data.settings.familyMembers);
  const { used, remaining, percent } = currentStatus;

  const handleUpdate = () => {
    const newData: AppData = {
      ...data,
      lpg: {
        ...data.lpg,
        lastRefill: refillDate,
        usageLevel: usageLevel as any
      }
    };
    onUpdate(newData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="glass-card p-8 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4">
            <h4 className="card-title-sm mb-0"><Flame size={12} className="text-orange-400" /> LPG Status</h4>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 py-1 bg-white/5 rounded-md">Live Preview</span>
          </div>
          
          <div className="relative w-56 h-56 my-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="100"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-slate-800"
              />
              <motion.circle
                key={`${percent}-${refillDate}`}
                initial={{ strokeDasharray: "0 1000" }}
                animate={{ strokeDasharray: `${(percent / 100) * 628} 1000` }}
                transition={{ duration: 1, ease: "easeOut" }}
                cx="112"
                cy="112"
                r="100"
                stroke="currentColor"
                strokeWidth="10"
                strokeLinecap="round"
                fill="transparent"
                className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-0">
              <span className="text-5xl font-bold text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]">{remaining}</span>
              <span className="text-[10px] text-text-dim uppercase font-bold tracking-[0.2em] mt-2">Days Left</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 w-full border-t border-white/5 pt-8">
            <div className="text-center">
              <p className="text-text-dim text-[10px] uppercase font-bold mb-1 tracking-widest">Days Used</p>
              <p className="text-2xl font-bold text-white">{used}</p>
            </div>
            <div className="text-center">
              <p className="text-text-dim text-[10px] uppercase font-bold mb-1 tracking-widest">Status</p>
              <p className={`text-2xl font-bold ${remaining < 5 ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]' : 'text-emerald-400'}`}>
                {remaining < 5 ? 'Critical' : 'Healthy'}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-8">
          <h4 className="card-title-sm"><RefreshCw size={12} className="text-orange-400" /> Update LGP Data</h4>
          <div className="space-y-6 pt-4">
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Last Refill Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="date" 
                  value={refillDate}
                  onChange={(e) => setRefillDate(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Usage Intensity</label>
              <div className="grid grid-cols-3 gap-3">
                {['Low', 'Medium', 'High'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setUsageLevel(level as any)}
                    className={`py-3 rounded-xl border transition-all font-bold ${
                      usageLevel === level 
                        ? 'bg-orange-600 border-orange-500 text-white shadow-[0_4px_15px_rgba(249,115,22,0.4)]' 
                        : 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={handleUpdate}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all font-bold shadow-[0_4px_20px_rgba(37,99,235,0.3)] mt-4"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="glass-card p-8">
          <h3 className="card-title-sm"><AlertCircle size={12} className="text-orange-400" /> Consumption Warnings</h3>
          <div className="space-y-4">
            {remaining < 10 && (
              <WarningItem 
                title="Refill Soon" 
                desc="Your cylinder is expected to finish in less than 10 days." 
              />
            )}
            {usageLevel === 'High' && (
              <WarningItem 
                title="High Consumption" 
                desc="Current usage level is reducing cylinder lifespan significantly." 
              />
            )}
            <WarningItem 
              title="Smart Insight" 
              desc="Covering pots while cooking can extend LPG by up to 3 days." 
            />
          </div>
        </div>

        <div className="glass-card p-8 bg-gradient-to-br from-orange-600/10 to-transparent">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Users className="text-orange-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Family Efficiency</p>
              <h4 className="text-xl font-bold">Smart Balancing</h4>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Your family of {data.settings.familyMembers} is currently using LPG at a {usageLevel.toLowerCase()} rate. 
            Keep monitoring to ensure you don't run out unexpectedly.
          </p>
          <div className="mt-6 p-4 glass rounded-xl flex items-center justify-between border-white/5 bg-white/5">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Efficiency Rank</span>
            <span className="text-sm font-bold text-white">#42 / Platinum</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WarningItem({ title, desc }: any) {
  return (
    <div className="p-4 rounded-xl border border-orange-500/10 bg-orange-500/5 flex gap-4 items-start">
      <div className="p-2 rounded-lg bg-slate-900/50 text-orange-400 mt-1">
        <Activity size={16} />
      </div>
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
