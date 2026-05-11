/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  Flame, 
  Lightbulb, 
  MessageSquare, 
  User, 
  Settings,
  Menu,
  X,
  TrendingDown,
  TrendingUp,
  Leaf,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppData, Page } from './types';
import Dashboard from './pages/Dashboard';
import Electricity from './pages/Electricity';
import LPG from './pages/LPG';
import Insights from './pages/Insights';
import ChatAssistant from './components/ChatAssistant';

function SettingsModal({ isOpen, onClose, data, onUpdate }: { isOpen: boolean, onClose: () => void, data: AppData, onUpdate: (data: AppData) => void }) {
  const [members, setMembers] = useState(data.settings.familyMembers);
  const [price, setPrice] = useState(data.electricity.pricePerUnit);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  // Sync state when data changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setMembers(data.settings.familyMembers);
      setPrice(data.electricity.pricePerUnit);
      setIsConfirmingReset(false);
    }
  }, [isOpen, data]);

  const handleSave = () => {
    onUpdate({
      ...data,
      settings: { ...data.settings, familyMembers: Number(members) },
      electricity: { ...data.electricity, pricePerUnit: Number(price) }
    });
    onClose();
  };

  const handleReset = () => {
    onUpdate({
      electricity: { history: [], pricePerUnit: 4 },
      lpg: { lastRefill: new Date().toISOString().split('T')[0], usageLevel: 'Medium' },
      settings: { familyMembers: 4 }
    });
    setIsConfirmingReset(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card w-full max-w-md p-8 relative z-10 bg-slate-900/90 border-white/10"
          >
            {!isConfirmingReset ? (
              <>
                <h3 className="text-2xl font-bold mb-6 text-white">Household Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Family Members</label>
                    <input 
                      type="number" 
                      value={members}
                      onChange={(e) => setMembers(Number(e.target.value))}
                      className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Electricity Price (₹/Unit)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={onClose} className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-slate-300 transition-colors">Cancel</button>
                  <button onClick={handleSave} className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white transition-colors shadow-lg shadow-blue-600/20">Save Changes</button>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <button 
                    onClick={() => setIsConfirmingReset(true)}
                    className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold text-sm transition-colors border border-red-500/20"
                  >
                    Reset All Data
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
                <p className="text-slate-400 text-sm mb-8">This will permanently delete all your electricity history and LPG records. This action cannot be undone.</p>
                <div className="flex flex-col gap-2">
                  <button onClick={handleReset} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors">Yes, Reset Everything</button>
                  <button onClick={() => setIsConfirmingReset(false)} className="w-full py-3 text-slate-400 font-bold hover:text-white transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/usage');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newData: AppData) => {
    setData((prev) => ({ ...prev, ...newData }));
    try {
      await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
    } catch (err) {
      console.error('Failed to save data', err);
    }
  };

  if (loading || !data) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0f172a]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"
        />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard data={data} />;
      case 'electricity': return <Electricity data={data} onUpdate={saveData} />;
      case 'lpg': return <LPG data={data} onUpdate={saveData} />;
      case 'insights': return <Insights data={data} />;
      default: return <Dashboard data={data} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'electricity', label: 'Electricity', icon: Zap },
    { id: 'lpg', label: 'LPG Usage', icon: Flame },
    { id: 'insights', label: 'Smart Insights', icon: Lightbulb },
  ];

  return (
    <div className="flex h-screen bg-brand-bg text-slate-200">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        data={data} 
        onUpdate={saveData} 
      />
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        className="bg-brand-bg/90 backdrop-blur-xl border-r border-brand-border flex flex-col relative z-20"
      >
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Zap className="text-white w-5 h-5" fill="white" />
          </div>
          {sidebarOpen && (
            <motion.h1 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-xl font-extrabold tracking-tighter text-white"
            >
              ConserveX
            </motion.h1>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id as Page)}
              className={`sidebar-item ${currentPage === item.id ? 'sidebar-item-active' : ''}`}
              title={item.label}
            >
              <item.icon size={18} />
              {sidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          {sidebarOpen && (
            <div className="glass-card p-4 mb-4 bg-blue-600/10 border-blue-600/20">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Family Plan</p>
              <p className="text-xs font-bold mt-1 text-white">{data.settings.familyMembers} Members Active</p>
            </div>
          )}
          <button className="sidebar-item w-full" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            {sidebarOpen && <span className="text-xs">Collapse Sidebar</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[#0f172a]">
        <header className="p-10 pb-6 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white capitalize">
              {currentPage === 'dashboard' ? 'Overview' : currentPage}
            </h2>
            <p className="text-text-dim text-sm mt-1 font-medium italic">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass-card px-4 py-2 flex items-center gap-3 bg-blue-600/5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] anim-pulse" />
              <span className="text-[11px] font-bold text-white uppercase tracking-widest">Systems Online</span>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 glass rounded-xl hover:bg-white/10 transition-colors border-white/5"
            >
              <Settings size={18} className="text-text-dim" />
            </button>
          </div>
        </header>

        <div className="px-10 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Chat Bot Button */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform z-50 group"
      >
        <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0f172a] neon-border-blue" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <ChatAssistant onClose={() => setIsChatOpen(false)} data={data} />
        )}
      </AnimatePresence>
    </div>
  );
}

