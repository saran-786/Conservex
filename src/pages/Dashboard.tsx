import React from 'react';
import { 
  Zap, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  LayoutDashboard,
  Calendar,
  IndianRupee,
  Activity,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppData } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardProps {
  data: AppData;
}

export default function Dashboard({ data }: DashboardProps) {
  const electricityHistory = data.electricity.history;
  const hasHistory = electricityHistory.length > 0;
  
  const latestUnits = hasHistory ? electricityHistory[electricityHistory.length - 1].units : 0;
  const previousUnits = electricityHistory.length > 1 ? electricityHistory[electricityHistory.length - 2].units : latestUnits;
  const change = previousUnits === 0 ? 0 : ((latestUnits - previousUnits) / previousUnits) * 100;

  const chartData = React.useMemo(() => ({
    labels: electricityHistory.map(h => `${h.month} ${h.year}`),
    datasets: [
      {
        label: 'Electricity Units',
        data: electricityHistory.map(h => h.units),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointHoverRadius: 6,
      },
    ],
  }), [electricityHistory]);

  const calculateLPGRemaining = () => {
    const start = new Date(data.lpg.lastRefill);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let expectedDuration = 30;
    if (data.lpg.usageLevel === 'High') expectedDuration -= 7;
    if (data.lpg.usageLevel === 'Low') expectedDuration += 9;
    if (data.settings.familyMembers > 4) expectedDuration -= Math.min(10, (data.settings.familyMembers - 4) * 2);

    return Math.max(0, expectedDuration - diffDays);
  };

  const lpgRemaining = calculateLPGRemaining();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#94a3b8',
        bodyColor: '#f1f5f9',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
      {/* 1. Electricity KPI */}
      <KPICard 
        title="Electricity Usage" 
        value={latestUnits} 
        unit="kWh"
        trend={hasHistory ? `${Math.abs(change).toFixed(1)}% vs last month` : 'No data yet'}
        isPositive={change <= 0}
        icon={Zap}
        color="blue"
      />

      {/* 2. LPG KPI */}
      <KPICard 
        title="LPG Status" 
        value={lpgRemaining} 
        unit="Days"
        trend={lpgRemaining < 5 ? "Refill soon recommended" : "Cylinder healthy"}
        isPositive={lpgRemaining >= 10}
        icon={Flame}
        color="orange"
      />

      {/* 3. Est. Bill KPI */}
      <KPICard 
        title="Est. Monthly Bill" 
        value={`₹${(latestUnits * data.electricity.pricePerUnit).toLocaleString()}`} 
        unit=""
        trend={hasHistory ? `Price: ₹${data.electricity.pricePerUnit}/unit` : 'Configure in settings'}
        isPositive={true}
        icon={IndianRupee}
        color="purple"
      />

      {/* 4. Eco Score Circle Card */}
      <div className="glass-card p-5 flex flex-col items-center justify-between">
        <h4 className="card-title-sm w-full"><Activity size={12} /> Eco Score</h4>
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="48" cy="48" r="40" stroke="rgba(30, 41, 59, 1)" strokeWidth="6" fill="transparent" />
            <circle cx="48" cy="48" r="40" stroke="#10b981" strokeWidth="6" strokeDasharray="251" strokeDashoffset={251 * (1 - 0.84)} strokeLinecap="round" fill="transparent" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
          </svg>
          <span className="absolute text-2xl font-bold text-emerald-400">84</span>
        </div>
        <p className="text-[10px] text-emerald-400 font-bold uppercase mt-2">Sustainable</p>
      </div>

      {/* 5. Consumption Trends (Large 2x2) */}
      <div className="lg:col-span-2 lg:row-span-2 glass-card p-6 flex flex-col overflow-hidden">
        <h4 className="card-title-sm"><TrendingUp size={12} /> Consumption Trends</h4>
        <div className="flex-1 mt-4 min-h-[220px]" key={`${electricityHistory.length}-${electricityHistory[electricityHistory.length-1]?.units || 0}`}>
          {hasHistory ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <Zap size={32} />
              <p className="text-sm font-medium">No consumption data found</p>
              <p className="text-xs">Go to Electricity page to add records</p>
            </div>
          )}
        </div>
      </div>

      {/* 6. Smart Insights (Wide 2x1) */}
      <div className="lg:col-span-2 glass-card p-6">
        <h4 className="card-title-sm"><Lightbulb size={12} /> Smart Insights</h4>
        <div className="space-y-3">
          <AlertRow color="orange" text="High peak usage detected between 7PM - 9PM." />
          <AlertRow color="green" text="Optimize AC settings to save more on your next bill." />
        </div>
      </div>

      {/* 7. Alerts & Notifications (Wide 2x1) */}
      <div className="lg:col-span-2 glass-card p-6">
        <h4 className="card-title-sm"><AlertCircle size={12} /> Alerts & Notifications</h4>
        <div className="space-y-3">
          <AlertRow color="blue" text="Welcome to ConserveX! Start tracking to save energy." />
          {lpgRemaining < 5 && <AlertRow color="red" text="LPG Cylinder level critical - refill suggested." />}
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, unit, trend, isPositive, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'text-blue-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
    green: 'text-emerald-400',
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="glass-card p-5 flex flex-col justify-between"
    >
      <h4 className="card-title-sm">{title}</h4>
      <div className="mt-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          {unit && <span className="text-xs text-slate-500 font-medium">{unit}</span>}
        </div>
        <p className={`text-[11px] mt-2 font-medium ${isPositive ? 'text-emerald-400' : 'text-orange-400'}`}>
          {isPositive ? '↓' : '↑'} {trend}
        </p>
      </div>
    </motion.div>
  );
}

function AlertRow({ color, text }: { color: string, text: string }) {
  const dotColors: any = {
    orange: 'bg-orange-500',
    green: 'bg-emerald-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
  };

  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <div className={`w-1.5 h-1.5 rounded-full ${dotColors[color]} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
      <span className="text-[13px] text-slate-300">{text}</span>
    </div>
  );
}
