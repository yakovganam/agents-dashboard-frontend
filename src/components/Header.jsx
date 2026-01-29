import React from 'react';
import { 
  Zap, 
  Activity, 
  DollarSign, 
  Globe, 
  ShieldCheck, 
  Bell, 
  Search,
  Command,
  Cloud
} from 'lucide-react';

export default function Header({ stats, isConnected }) {
  return (
    <header className="flex items-center justify-between p-6 bg-transparent relative z-20 animate-in fade-in slide-in-from-top-4 duration-1000">
      {/* Search Bar - Professional Look */}
      <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md group">
        <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input 
                type="text" 
                placeholder="Search telemetry, agents or logs..." 
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-12 text-sm font-bold text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all shadow-inner"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <Command size={10} /> K
            </div>
        </div>
      </div>

      {/* Global Metrics Bar */}
      <div className="flex items-center gap-4">
        {/* Active Agents */}
        <div className="flex items-center gap-3 px-5 py-3 glass rounded-2xl border-white/5 group hover:border-primary/30 transition-all">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
            <Activity size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Active</p>
            <p className="text-sm font-black text-white leading-none tracking-tighter italic">{stats.activeAgents}</p>
          </div>
        </div>

        {/* Neural Load */}
        <div className="flex items-center gap-3 px-5 py-3 glass rounded-2xl border-white/5 group hover:border-amber-500/30 transition-all">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
            <Zap size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Load</p>
            <p className="text-sm font-black text-white leading-none tracking-tighter italic">{Number(stats.totalTokens).toLocaleString()}</p>
          </div>
        </div>

        {/* Global Cost */}
        <div className="flex items-center gap-3 px-5 py-3 glass rounded-2xl border-white/5 group hover:border-emerald-500/30 transition-all">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
            <DollarSign size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Billing</p>
            <p className="text-sm font-black text-white leading-none tracking-tighter italic">${stats.totalCost}</p>
          </div>
        </div>

        <div className="w-[1px] h-10 bg-white/5 mx-2"></div>

        {/* Notifications & Connectivity */}
        <div className="flex items-center gap-2">
            <button className="p-3 rounded-2xl bg-white/5 border border-white/5 text-muted-foreground hover:bg-white/10 hover:text-white transition-all relative">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-slate-950"></span>
            </button>
            <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all ${
                isConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse'
            }`}>
                {isConnected ? <Cloud size={18} /> : <ShieldCheck size={18} />}
                <span className="text-[10px] font-black uppercase tracking-widest">{isConnected ? 'Online' : 'Linking...'}</span>
            </div>
        </div>
      </div>
    </header>
  );
}
