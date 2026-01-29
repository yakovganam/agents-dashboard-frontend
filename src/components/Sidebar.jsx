import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  CheckCircle2, 
  Activity, 
  AlertCircle,
  Menu,
  ChevronLeft,
  Settings,
  Plus
} from 'lucide-react';
import AgentCard from './AgentCard';

const filterTabs = [
  { label: 'All', value: 'all', icon: LayoutGrid },
  { label: 'Running', value: 'running', icon: Activity },
  { label: 'Completed', value: 'completed', icon: CheckCircle2 },
  { label: 'Errors', value: 'error', icon: AlertCircle }
];

export default function Sidebar({ agents, selectedAgent, onSelectAgent }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredAgents = useMemo(() => {
    let filtered = agents;
    if (activeTab !== 'all') {
      filtered = filtered.filter(agent => agent.status === activeTab);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(term) ||
        agent.label?.toLowerCase().includes(term) ||
        agent.model.toLowerCase().includes(term) ||
        agent.id.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [agents, activeTab, searchTerm]);

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 360 }}
      className="h-screen bg-card border-r border-border flex flex-col relative z-20"
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-6">
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Activity className="text-primary-foreground" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Clawdbot</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Control Center</p>
              </div>
            </motion.div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {!isCollapsed && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search instances..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold shadow-lg shadow-primary/10 hover:opacity-90 transition-all">
              <Plus size={16} />
              New Deployment
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {!isCollapsed && (
        <div className="px-4 py-2 border-b border-border/50 flex gap-1 overflow-x-auto no-scrollbar">
          {filterTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            const count = tab.value === 'all' ? agents.length : agents.filter(a => a.status === tab.value).length;

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon size={14} />
                {tab.label}
                <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${isActive ? "bg-primary/20" : "bg-muted"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredAgents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 opacity-30"
            >
              <LayoutGrid size={40} className="mb-2" />
              <p className="text-sm font-medium">No results found</p>
            </motion.div>
          ) : (
            filteredAgents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                selected={selectedAgent?.id === agent.id}
                onClick={onSelectAgent}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border/50">
          <button className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-xl transition-all text-sm font-medium text-muted-foreground group">
            <Settings size={18} className="group-hover:rotate-45 transition-transform" />
            Workspace Settings
          </button>
        </div>
      )}
    </motion.aside>
  );
}
