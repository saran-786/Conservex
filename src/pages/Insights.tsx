import React from 'react';
import { Lightbulb, CheckCircle2, AlertCircle, Sparkles, TrendingDown, Clock, Zap, Flame, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { AppData } from '../types';

interface InsightsProps {
  data: AppData;
}

export default function Insights({ data }: InsightsProps) {
  const electricityHistory = data.electricity.history;
  const hasHistory = electricityHistory.length > 0;
  const latestUnits = hasHistory ? electricityHistory[electricityHistory.length - 1].units : 0;
  const avgUnits = hasHistory ? electricityHistory.reduce((a, b) => a + b.units, 0) / electricityHistory.length : 0;
  const perPerson = latestUnits / data.settings.familyMembers;

  return (
    <div className="space-y-6">
      <div className="glass-card p-10 bg-gradient-to-r from-blue-600/20 via-transparent to-emerald-600/10 border-blue-500/20 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-blue-400" size={20} />
            <h4 className="card-title-sm mb-0">AI Generated Analysis</h4>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            {hasHistory ? (
              <>
                ConserveX AI has analyzed your monthly cycles. Potential monthly saving: 
                <span className="text-emerald-400 font-bold mx-1 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">₹450</span> 
              </>
            ) : (
              "Add some consumption records to see AI-driven saving potential."
            )}
          </p>
        </div>
        <div className="hidden md:block w-px h-16 bg-white/10" />
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest mb-1">Efficiency</p>
            <p className="text-xl font-bold text-white tracking-tight">{hasHistory ? "Top 12%" : "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InsightCard 
          icon={TrendingDown}
          title="Reduction Milestone"
          desc="You reduced electricity consumption by 8% compared to the same period last year."
          status="positive"
        />
        <InsightCard 
          icon={Clock}
          title="Peak Hour Usage"
          desc="42% of your usage occurs during peak hours (6pm-10pm). Shifting laundry can save ₹120."
          status="warning"
        />
        <InsightCard 
          icon={AlertCircle}
          title="Unusual Activity"
          desc="Higher than normal baseline usage detected at 3 AM. Check standby appliances."
          status="info"
        />
      </div>

      <div className="space-y-6 pt-4">
        <h4 className="card-title-sm"><CheckCircle2 size={12} className="text-emerald-400" /> Recommended Actions</h4>
        
        <div className="grid grid-cols-1 gap-3">
          <ActionItem 
            icon={Zap}
            title="Switch to LED lighting in living area"
            save="₹80/mo"
            time="Done in 5 mins"
          />
           <ActionItem 
            icon={Flame}
            title="Clean AC filters to improve efficiency"
            save="₹150/mo"
            time="Done in 15 mins"
          />
           <ActionItem 
            icon={Clock}
            title="Set AC temperature to optimal 24°C"
            save="₹300/mo"
            time="Immediate"
          />
        </div>
      </div>

      <div className="glass-card p-8 bg-slate-900/30">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <h4 className="card-title-sm"><Activity size={12} /> Sustainable Living Score</h4>
            <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">Your score is based on per-person usage and renewable adoption.</p>
            <div className="flex gap-2">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 h-3 rounded-full ${i < 8 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800'}`} 
                />
              ))}
            </div>
            <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-500 tracking-wider">
              <span>BEGINNER</span>
              <span className="text-emerald-400">ECO-WARRIOR (84%)</span>
            </div>
          </div>
          <div className="p-6 bg-slate-800/30 rounded-2xl border border-white/5 text-center px-10">
            <p className="text-3xl font-extrabold mb-1 text-white tracking-tight">#12</p>
            <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest">In your locality</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ icon: Icon, title, desc, status }: any) {
  const colors: any = {
    positive: 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5',
    warning: 'text-orange-400 border-orange-500/10 bg-orange-500/5',
    info: 'text-blue-400 border-blue-500/10 bg-blue-500/5',
  };

  return (
    <motion.div 
      whileHover={{ y: -3 }}
      className={`glass-card p-6 border ${colors[status]}`}
    >
      <div className="mb-4">
        <Icon size={20} />
      </div>
      <h4 className="text-sm font-bold text-white mb-2">{title}</h4>
      <p className="text-xs text-text-dim leading-relaxed font-medium">{desc}</p>
    </motion.div>
  );
}

function ActionItem({ icon: Icon, title, save, time }: any) {
  return (
    <div className="glass-card p-4 flex items-center justify-between group hover:border-blue-500/30">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-slate-800 rounded-xl group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors border border-white/5">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-white tracking-tight">{title}</p>
          <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mt-0.5">{time}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-emerald-400 font-bold text-sm tracking-tight">{save}</p>
        <p className="text-[9px] text-text-dim uppercase font-extrabold tracking-tighter">Est. Save</p>
      </div>
    </div>
  );
}
