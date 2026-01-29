import React, { useState } from 'react';
import { 
  Search, 
  Cpu, 
  Circle, 
  Filter, 
  MoreVertical, 
  Zap, 
  Clock, 
  AlertCircle,
  Plus,
  Box,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ agents, selectedAgent, onSelectAgent }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, running, completed, error

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = (agent.label || agent.name || agent.id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || agent.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
      case 'active':
      case 'starting':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-emerald-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  const stats = {
    all: agents.length,
    running: agents.filter(a => a.status === 'running' || a.status === 'active' || a.status === 'starting').length,
    completed: agents.filter(a => a.status === 'completed').length,
    error: agents.filter(a => a.status === 'error').length
  };

  return (
    <aside className="w-[320px] flex flex-col h-full bg-black/20 border-r border-white/5 animate-in slide-in-from-left-4 duration-700">
      {/* Sidebar Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <Layers size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black tracking-tighter text-white uppercase italic">Neural Stack</h2>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Control Center</p>
                </div>
            </div>
            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-muted-foreground hover:bg-white/10 transition-all">
                <Plus size={20} />
            </button>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
          <input
            type="text"
            placeholder="Filter instances..."
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 mb-4 flex gap-1 bg-white/5 p-1 mx-6 rounded-2xl border border-white/5">
        {[
          { id: 'all', label: 'All', icon: Box, count: stats.all },
          { id: 'running', label: 'Running', icon: Zap, count: stats.running },
          { id: 'completed', label: 'Done', icon: Circle, count: stats.completed },
          { id: 'error', label: 'Errors', icon: AlertCircle, count: stats.error }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${
              filter === tab.id ? 'bg-white/10 text-white shadow-lg' : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="opacity-50">{tab.count}</span>
            <span className="scale-75">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-hide">
        {filteredAgents.length > 0 ? (
          filteredAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`w-full group relative p-4 rounded-3xl transition-all duration-300 border ${
                selectedAgent?.id === agent.id 
                  ? 'bg-white/10 border-white/10 shadow-2xl' 
                  : 'bg-transparent border-transparent hover:bg-white/5'
              }`}
            >
              {selectedAgent?.id === agent.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-primary rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
              )}
              
              <div className="flex items-start gap-4">
                <div className="relative">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-inner bg-white/5 border border-white/5 transition-transform duration-500 group-hover:scale-110`}>
                        <Cpu size={24} />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-slate-950 ${getStatusColor(agent.status)} ${
                        (agent.status === 'running' || agent.status === 'active') ? 'animate-pulse' : ''
                    }`}></div>
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-sm font-black text-white tracking-tighter truncate uppercase group-hover:text-primary transition-colors">
                    {agent.label || agent.name}
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground mt-0.5 truncate uppercase tracking-widest opacity-50">
                    {agent.model}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 text-[10px] font-black text-muted-foreground">
                        <Clock size={10} className="opacity-50"/>
                        {agent.status === 'running' ? 'Active' : 'Ended'}
                    </div>
                    <span className="w-1 h-1 rounded-full bg-white/10"></span>
                    <div className="flex items-center gap-1 text-[10px] font-black text-muted-foreground">
                        <Zap size={10} className="opacity-50 text-amber-500"/>
                        {(agent.totalTokens || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    <ChevronRight size={14} className={`text-muted-foreground transition-all duration-300 ${
                        selectedAgent?.id === agent.id ? 'translate-x-0 opacity-100 text-primary' : '-translate-x-2 opacity-0'
                    }`} />
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
            <Box size={40} className="text-muted-foreground" />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">No Entities Found</p>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-white/5">
        <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent"></div>
            <div className="text-left">
                <p className="text-[10px] font-black text-white uppercase tracking-tighter">Admin Control</p>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Yakov Platform</p>
            </div>
          </div>
          <MoreVertical size={16} className="text-muted-foreground group-hover:text-white transition-colors" />
        </button>
      </div>
    </aside>
  );
}
