import React from 'react';
import { Cpu, Zap, DollarSign, Activity, Globe, Bell } from 'lucide-react';

const StatBox = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 px-4 py-2 glass rounded-xl border-white/5">
    <div className={`p-2 rounded-lg bg-${color}/10 text-${color}`}>
      <Icon size={18} />
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{label}</span>
      <span className="text-sm font-semibold tracking-tight">{value}</span>
    </div>
  </div>
);

export default function Header({ stats, isConnected }) {
  return (
    <header className="h-20 border-b border-border/50 px-8 flex items-center justify-between glass z-10">
      <div className="flex items-center gap-8">
        <StatBox 
          icon={Activity} 
          label="Active Agents" 
          value={stats.activeAgents} 
          color="blue-500" 
        />
        <StatBox 
          icon={Cpu} 
          label="Avg Tokens/Hr" 
          value={`${stats.avgTokensPerHour}/h`} 
          color="purple-500" 
        />
        <StatBox 
          icon={DollarSign} 
          label="Total Cost" 
          value={`$${stats.totalCost}`} 
          color="emerald-500" 
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
          <span className="text-[10px] font-bold uppercase tracking-tight">
            {isConnected ? 'Gateway Active' : 'Gateway Offline'}
          </span>
        </div>
        
        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground">
          <Bell size={20} />
        </button>
        
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xs font-bold border-2 border-background shadow-lg">
          JD
        </div>
      </div>
    </header>
  );
}
