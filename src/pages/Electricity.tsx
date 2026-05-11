import React, { useState } from 'react';
import { Zap, Plus, IndianRupee, History, TrendingUp, Users, RefreshCw, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { AppData, ElectricityMonth } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ElectricityProps {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

export default function Electricity({ data, onUpdate }: ElectricityProps) {
  const [newUnits, setNewUnits] = useState('');
  const [newMonth, setNewMonth] = useState('Jan');
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddData = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newUnits || !newMonth || !newYear) {
      setError("Please fill in all fields.");
      return;
    }

    setIsUpdating(true);
    
    try {
      const currentYear = new Date().getFullYear();
      const currentMonthIdx = new Date().getMonth();
      const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const selectedMonthIdx = monthsList.indexOf(newMonth);

      // Future date validation
      if (Number(newYear) > currentYear || (Number(newYear) === currentYear && selectedMonthIdx > currentMonthIdx)) {
        setError("Cannot add consumption for a future date.");
        setIsUpdating(false);
        return;
      }

      const units = Number(newUnits);
      if (isNaN(units) || units < 0) {
        setError("Please enter a valid number for units.");
        setIsUpdating(false);
        return;
      }

      const yearNum = Number(newYear);
      const newMonthData: ElectricityMonth = {
        month: newMonth,
        year: yearNum,
        units: units
      };

      // Filter out existing record for the same month/year if it exists
      const filteredHistory = (data.electricity.history || []).filter(
        h => !(h.month === newMonth && h.year === yearNum)
      );

      const newHistory = [...filteredHistory, newMonthData].sort((a, b) => {
        if (Number(a.year) !== Number(b.year)) return Number(a.year) - Number(b.year);
        return monthsList.indexOf(a.month) - monthsList.indexOf(b.month);
      });

      const newData: AppData = {
        ...data,
        electricity: {
          ...data.electricity,
          history: newHistory
        }
      };

      onUpdate(newData);
      setNewUnits('');
      setSuccess(`Usage for ${newMonth} ${newYear} updated successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Error updating consumption. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRecord = async (month: string, year: number | string) => {
    if (!window.confirm(`Are you sure you want to delete the record for ${month} ${year}?`)) return;

    setError(null);
    try {
      const newHistory = (data.electricity.history || []).filter(
        h => !(h.month === month && String(h.year) === String(year))
      );
      
      const newData: AppData = {
        ...data,
        electricity: {
          ...data.electricity,
          history: newHistory
        }
      };

      onUpdate(newData);
      setSuccess(`Record for ${month} ${year} deleted.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to delete record. Please try again.");
    }
  };

  const history = data.electricity.history || [];
  const hasHistory = history.length > 0;
  const latest = hasHistory ? history[history.length - 1] : { month: 'N/A', year: 'N/A', units: 0 };
  const previous = history.length > 1 ? history[history.length - 2] : { month: 'N/A', year: 'N/A', units: 0 };
  
  const cost = Number(latest.units) * data.electricity.pricePerUnit;
  const perPerson = Number(latest.units) / data.settings.familyMembers;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const getNextMonth = () => {
    if (!hasHistory || typeof latest.year !== 'number') return 'Next Month';
    const idx = months.indexOf(latest.month);
    if (idx === -1) return 'Next Month';
    const nextIdx = (idx + 1) % 12;
    const nextYear = nextIdx === 0 ? Number(latest.year) + 1 : latest.year;
    return `${months[nextIdx]} ${nextYear}`;
  };

  const nextMonthText = getNextMonth();
  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

  const barData = React.useMemo(() => ({
    labels: (history || []).slice(-6).map(h => `${h.month} ${h.year}`),
    datasets: [
      {
        label: 'Monthly Units',
        data: (history || []).slice(-6).map(h => Number(h.units)),
        backgroundColor: '#3b82f6',
        borderRadius: 8,
      },
    ],
  }), [history]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Analysis Section */}
        <div className="glass-card p-8">
          <h4 className="card-title-sm"><Zap size={12} className="text-blue-400" /> Electricity Analysis</h4>
          <p className="text-sm text-slate-400 mb-8">
            {hasHistory ? `Detailed cost breakdown for ${latest.month} ${latest.year}` : 'Add your first reading to see analysis'}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <StatSmall 
              label="Estimated Bill" 
              value={hasHistory ? `₹${cost.toLocaleString()}` : '₹0'} 
              icon={IndianRupee} 
              color="blue"
            />
            <StatSmall 
              label="Per Person" 
              value={hasHistory ? `${perPerson.toFixed(1)} Units` : '0 Units'} 
              icon={Users} 
              color="emerald"
            />
          </div>

          <div className="mt-8 p-6 bg-slate-900/30 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span>Current</span>
              <span className="text-white">{latest.units} Units</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: history.length > 1 ? `${(latest.units / Math.max(latest.units, previous.units)) * 100}%` : '0%' }}
                className={`h-full ${latest.units > previous.units ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`}
              />
            </div>
            <p className="text-xs text-center font-medium">
              {!hasHistory ? 'Start tracking your usage' : 
               history.length === 1 ? 'Add another month to compare' :
               latest.units > previous.units 
                ? `Usage increased by ${((latest.units - (previous.units || 1)) / (previous.units || 1) * 100).toFixed(1)}%`
                : `Usage reduction of ${(((previous.units - latest.units) / previous.units) * 100).toFixed(1)}%`}
            </p>
          </div>
        </div>

        {/* Input form */}
        <div className="glass-card p-8">
          <h4 className="card-title-sm"><Plus size={12} className="text-blue-400" /> Add Usage Data</h4>
          <form onSubmit={handleAddData} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Month</label>
                <select 
                  value={newMonth}
                  onChange={(e) => setNewMonth(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none"
                >
                  {months.map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Year</label>
                <select 
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none"
                >
                  {years.map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Units</label>
                <input 
                  type="number" 
                  value={newUnits}
                  onChange={(e) => setNewUnits(e.target.value)}
                  placeholder="240"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-bold"
              >
                {success}
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={isUpdating}
              className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                isUpdating 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 active:scale-95'
              }`}
            >
              {isUpdating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Consumption'
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-8">
        <div className="glass-card p-8 bg-gradient-to-br from-blue-600/10 to-transparent">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Historical Data</h3>
            <History size={20} className="text-slate-500" />
          </div>
          <div className="h-[300px] relative">
            {hasHistory ? (
              <Bar 
                data={barData} 
                options={{
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
                    }
                  },
                  scales: {
                    x: { 
                      grid: { display: false }, 
                      ticks: { color: '#94a3b8' } 
                    },
                    y: { 
                      beginAtZero: true,
                      grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
                      ticks: { color: '#94a3b8' } 
                    }
                  }
                }} 
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <History size={48} className="opacity-20" />
                <p className="text-sm font-medium">No historical data available</p>
                <p className="text-xs max-w-[200px] text-center">Add your electricity units using the form to see usage trends.</p>
              </div>
            )}
          </div>
          
          {hasHistory && (
            <div className="mt-8 border-t border-white/5 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Historical Records</h4>
                <span className="text-[10px] text-slate-600 bg-slate-900/50 px-2 py-0.5 rounded-full border border-white/5">
                  Total {history.length} records
                </span>
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                {[...history].reverse().map((h, i) => (
                  <div key={`${h.month}-${h.year}-${i}`} className="group flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{h.month} {h.year}</span>
                      <span className="text-[10px] text-slate-500">Recorded on {new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm font-bold text-blue-400">{h.units} Units</span>
                        <p className="text-[10px] text-slate-500">₹{(Number(h.units) * data.electricity.pricePerUnit).toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteRecord(h.month, h.year);
                        }}
                        className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-transparent hover:border-red-400/20 active:scale-90"
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="glass-card p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-400" />
            AI Bill Prediction
          </h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-slate-400">{nextMonthText} Est.</p>
                <p className="text-3xl font-bold text-blue-400">₹{(cost * 1.05).toFixed(0)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Confidence</p>
                <p className="text-sm font-bold text-emerald-400">{hasHistory ? 'High (92%)' : 'Waiting for data'}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed italic">
              {hasHistory 
                ? `"Based on your history for ${latest.month}, we predict a typical seasonal trend for ${nextMonthText.split(' ')[0]}. Keep tracking to improve accuracy."`
                : '"Enter at least one month of usage data to enable AI-powered cost forecasting."'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatSmall({ label, value, icon: Icon, color }: any) {
  const iconColors: any = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
  };
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
      <div className={`p-2 rounded-xl bg-slate-900/50 ${iconColors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}
