import React, { useState, useMemo } from 'react';
import { 
  PlayCircle, 
  Square, 
  RotateCcw, 
  Trash2, 
  Download, 
  Clock, 
  Zap, 
  DollarSign, 
  Cpu, 
  ChevronRight,
  LineChart as ChartIcon,
  Terminal as TerminalIcon,
  Activity
} from 'lucide-react';
import LogsViewer from './LogsViewer';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const StatCard = ({ icon: Icon, label, value, subValue, color }) => (
  <div className="glass p-5 rounded-2xl border-white/5 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`}></div>
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.15em] mb-1">{label}</p>
        <h4 className="text-2xl font-bold tracking-tight">{value}</h4>
        {subValue && <p className="text-[10px] text-muted-foreground mt-1 font-medium">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-xl bg-${color}/10 text-${color}`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

export default function MainPanel({ agent, logs, onRefresh, agents }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');

  // Mock data for the chart - in real use, would be derived from agent history
  const chartData = useMemo(() => {
    if (!agent) return [];
    return [
      { name: '10:00', tokens: 400, cost: 0.002 },
      { name: '10:15', tokens: 1200, cost: 0.008 },
      { name: '10:30', tokens: 900, cost: 0.006 },
      { name: '10:45', tokens: 2400, cost: 0.012 },
      { name: '11:00', tokens: 1800, cost: 0.009 },
      { name: '11:15', tokens: 3200, cost: 0.021 },
      { name: 'Current', tokens: agent.metrics?.tokensUsed || 0, cost: agent.metrics?.totalCost || 0 },
    ];
  }, [agent]);

  if (!agent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-700">
        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-muted-foreground animate-bounce">
          <Activity size={40} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-tight">System Ready</h2>
          <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest mt-1">Select an agent to monitor activity</p>
        </div>
      </div>
    );
  }

  const handleControl = async (action) => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/agents/${agent.id}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      onRefresh();
    } catch (error) {
      console.error('Error controlling agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/agents/${agent.id}/logs/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agent-${agent.id}-logs.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const getElapsedTime = () => {
    if (!agent.startTime) return '0s';
    const start = agent.startTime;
    const end = agent.endTime || Date.now();
    const elapsed = Math.floor((end - start) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

    // Determined values for UI
    const isRunning = agent.status === 'running' || agent.status === 'active' || agent.status === 'starting';
    const tokensUsed = agent.metrics?.tokensUsed || agent.totalTokens || 0;
    const tokensIn = agent.tokensIn || agent.inputTokens || 0;
    const tokensOut = agent.tokensOut || agent.outputTokens || 0;
    const totalCost = agent.metrics?.totalCost || (tokensUsed * 0.00002);
    const startTime = agent.startTime || agent.createdAt || Date.now();

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Agent Header Section */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Cpu size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-black tracking-tighter">{agent.label || agent.name || agent.id}</h2>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                isRunning ? 'bg-blue-500/20 text-blue-400' :
                                agent.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                                {agent.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <span>{agent.model}</span>
                            <ChevronRight size={12} />
                            <span className="font-mono">{agent.id}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {isRunning ? (
                        <button 
                            onClick={() => handleControl('stop')}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-500 rounded-xl font-bold text-sm border border-orange-500/20 hover:bg-orange-500/20 transition-all"
                        >
                            <Square size={16} fill="currentColor" /> Stop Agent
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleControl('restart')}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-sm border border-primary/20 hover:bg-primary/20 transition-all"
                        >
                            <RotateCcw size={16} /> Restart
                        </button>
                    )}
                    <button 
                        onClick={handleExportLogs}
                        className="p-2 bg-white/5 text-muted-foreground rounded-xl hover:bg-white/10 border border-white/5 transition-all"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Progress if running */}
            {isRunning && (
                <div className="glass p-4 rounded-2xl border-white/5">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">Current Execution Progress</span>
                        <span className="text-xl font-black italic">{agent.progress || 0}%</span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_2s_infinite_linear] transition-all duration-1000" 
                            style={{ width: `${agent.progress || 0}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                    icon={Clock} 
                    label="Running Time" 
                    value={getElapsedTime()} 
                    subValue={`Started: ${new Date(startTime).toLocaleTimeString()}`}
                    color="blue-500"
                />
                <StatCard 
                    icon={Zap} 
                    label="Tokens Used" 
                    value={(tokensUsed).toLocaleString()} 
                    subValue={`${tokensIn} in / ${tokensOut} out`}
                    color="indigo-500"
                />
                <StatCard 
                    icon={DollarSign} 
                    label="Total Cost" 
                    value={`$${(totalCost).toFixed(4)}`} 
                    subValue="Est. Realtime Billing"
                    color="emerald-500"
                />
            </div>


      {/* Task & Visualization Tabs */}
      <div className="flex-1 flex flex-col min-h-[400px]">
        <div className="flex border-b border-border/50 mb-4">
          <button 
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-tight border-b-2 transition-all ${
              activeTab === 'logs' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <TerminalIcon size={16} /> Logs Output
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-tight border-b-2 transition-all ${
              activeTab === 'analytics' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ChartIcon size={16} /> Performance
          </button>
        </div>

        <div className="flex-1 glass rounded-2xl border-white/5 overflow-hidden flex flex-col">
          {activeTab === 'logs' ? (
            <LogsViewer logs={logs} agentId={agent.id} />
          ) : (
            <div className="p-8 h-full flex flex-col">
              <h3 className="text-lg font-bold mb-6">Token Consumption Trend</h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111113', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Area type="monotone" dataKey="tokens" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTokens)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
