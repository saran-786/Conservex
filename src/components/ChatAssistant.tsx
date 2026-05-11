import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { AppData } from '../types';

interface ChatAssistantProps {
  onClose: () => void;
  data: AppData;
}

export default function ChatAssistant({ onClose, data }: ChatAssistantProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Hello! I am your ConserveX Assistant 🤖. How can I help you save energy today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const context = `You are ConserveX Assistant, a smart home energy consultant. 
      The current household data is:
      - Family members: ${data.settings.familyMembers}
      - Latest electricity units: ${data.electricity.history[data.electricity.history.length-1].units}
      - Electricity price: ₹${data.electricity.pricePerUnit}/unit
      - LPG last refill: ${data.lpg.lastRefill}
      - LPG usage level: ${data.lpg.usageLevel}
      
      Keep your answers short and futuristic. Suggest specific savings based on this data if applicable.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: context
        }
      });

      const aiResponse = response.text || "I'm sorry, I couldn't process that. Can you try again?";
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to neural link. Please check your connection." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.9 }}
      className="fixed bottom-24 right-8 w-[400px] max-h-[600px] h-[80vh] glass rounded-3xl shadow-2xl flex flex-col z-[60] overflow-hidden border-blue-500/30"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-blue-600/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Bot className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold">ConserveX AI</h3>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active • Neural Link</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'glass-card border-blue-500/10 rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass-card p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-400" />
              <span className="text-xs text-slate-400">Processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-white/5 bg-slate-900/30">
        {['Save LPG', 'Reduce Bill', 'Eco Score', 'Usage Tips'].map((t) => (
          <button 
            key={t}
            onClick={() => setInput(`Give me some ${t.toLowerCase()} tips.`)}
            className="whitespace-nowrap px-3 py-1.5 glass rounded-lg text-xs hover:border-blue-500/50 transition-colors"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-slate-900/50 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
        />
        <button 
          type="submit" 
          disabled={isTyping}
          className="p-3 bg-blue-600 rounded-xl text-white hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg"
        >
          <Send size={20} />
        </button>
      </form>
    </motion.div>
  );
}
