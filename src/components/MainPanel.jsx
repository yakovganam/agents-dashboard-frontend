import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  PlayCircle, 
  Square, 
  RotateCcw, 
  Download, 
  Clock, 
  Zap, 
  DollarSign, 
  Cpu, 
  ChevronRight,
  LineChart as ChartIcon,
  Terminal as TerminalIcon,
  Activity,
  Box,
  LayoutDashboard,
  Server,
  Code,
  Send,
  Sparkles
} from 'lucide-react';
import LogsViewer from './LogsViewer';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const StatCard = ({ icon: Icon, label, value, subValue, color, delay }) => (
  <div 
    className="glass p-5 rounded-2xl border-white/5 relative overflow-hidden group animate-in slide-in-from-bottom-4 duration-500 fill-mode-both"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`}></div>
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.15em] mb-1">{label}</p>
        <h4 className="text-2xl font-bold tracking-tight text-white">{value}</h4>
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
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const chartData = useMemo(() => {
    if (!agent) return [];
    const base = agent.totalTokens || 0;
    return [
      { name: 'Start', tokens: Math.floor(base * 0.1) },
      { name: '15m', tokens: Math.floor(base * 0.3) },
      { name: '30m', tokens: Math.floor(base * 0.45) },
      { name: '45m', tokens: Math.floor(base * 0.7) },
      { name: '60m', tokens: Math.floor(base * 0.85) },
      { name: 'Now', tokens: base },
    ];
  }, [agent]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      await fetch(`${API_URL}/api/agents/${agent.id}/control`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ action: 'message', message })
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!agent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-1000">
        <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-primary relative z-10 shadow-2xl">
                <LayoutDashboard size={48} />
            </div>
        </div>
        <div className="text-center relative z-10">
          <h2 className="text-2xl font-black tracking-tighter text-white">Neural Hub Ready</h2>
          <p className="text-sm text-muted-foreground uppercase font-black tracking-[0.3em] mt-2 animate-pulse">Select an active entity to monitor</p>
        </div>
        <div className="flex gap-4 mt-8 opacity-40">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><Server size={12}/> Systems Nominal</div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><Code size={12}/> v2.5.0-PRO</div>
        </div>
      </div>
    );
  }

  const handleControl = async (action) => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/agents/${agent.id}/control`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ action })
      });
      onRefresh();
    } catch (error) {
      console.error('Error controlling agent:', error);
    } finally {
      setLoading(false);
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

  const isRunning = agent.status === 'running' || agent.status === 'active' || agent.status === 'starting';
  const tokensUsed = agent.totalTokens || 0;
  const tokensIn = agent.inputTokens || 0;
  const tokensOut = agent.outputTokens || 0;
  const totalCost = (tokensUsed * 0.00002);

  return (
    <div className="space-y-6 flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-700">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className={`absolute inset-0 ${isRunning ? 'bg-primary/40' : 'bg-emerald-500/20'} blur-xl rounded-full animate-pulse group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white relative z-10 shadow-2xl overflow-hidden">
                {isRunning ? <Activity size={32} className="animate-pulse" /> : <Box size={32} />}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-black tracking-tighter text-white uppercase">{agent.label || agent.name}</h2>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                isRunning ? 'bg-primary/20 text-primary animate-pulse border border-primary/30' : 
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-primary animate-ping' : 'bg-emerald-400'}`}></span>
                {agent.status}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <span className="flex items-center gap-1"><Cpu size={12}/> {agent.model}</span>
              <span className="opacity-20">|</span>
              <span className="font-mono lowercase opacity-50">{agent.id}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {isRunning ? (
            <button 
              onClick={() => handleControl('stop')}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg shadow-red-500/10 group"
            >
              <Square size={16} fill="currentColor" className="group-hover:scale-110 transition-transform" /> Emergency Stop
            </button>
          ) : (
            <button 
              onClick={() => handleControl('restart')}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-2xl font-black text-xs uppercase tracking-widest border border-primary/20 hover:bg-primary hover:text-white transition-all duration-300 shadow-lg shadow-primary/10 group"
            >
              <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> Initiate Restart
            </button>
          )}
          <button className="p-3 bg-white/5 text-muted-foreground rounded-2xl hover:bg-white/10 border border-white/5 transition-all shadow-xl">
            <Download size={24} />
          </button>
        </div>
      </div>

      {/* Progress Monitor */}
      {isRunning && (
        <div className="glass p-5 rounded-3xl border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
          <div className="flex justify-between items-end mb-3 relative z-10">
            <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Neural Link Stability</span>
                <p className="text-xs text-muted-foreground font-medium italic">Streaming active cognitive patterns...</p>
            </div>
            <span className="text-3xl font-black italic text-white leading-none">{agent.progress || 0}%</span>
          </div>
          <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative z-10">
            <div 
              className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_2s_infinite_linear] transition-all duration-1000 shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
              style={{ width: `${agent.progress || 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Unified Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard 
            icon={Clock} 
            label="Active Duration" 
            value={getElapsedTime()} 
            subValue={`INIT: ${new Date(agent.startTime || agent.createdAt).toLocaleTimeString()}`}
            color="blue-500"
            delay={100}
        />
        <StatCard 
            icon={Zap} 
            label="Neural Load (Tokens)" 
            value={tokensUsed.toLocaleString()} 
            subValue={`RX: ${tokensIn} / TX: ${tokensOut}`}
            color="indigo-500"
            delay={200}
        />
        <StatCard 
            icon={DollarSign} 
            label="Compute Cost" 
            value={`$${totalCost.toFixed(4)}`} 
            subValue="Real-time Value Estimate"
            color="emerald-500"
            delay={300}
        />
      </div>

      {/* Main Console Area */}
      <div className="flex-1 flex flex-col min-h-[500px] glass rounded-[2.5rem] border-white/5 overflow-hidden relative">
        <div className="flex bg-white/5 p-2 gap-2">
          <button 
            onClick={() => setActiveTab('logs')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              activeTab === 'logs' ? 'bg-white/10 text-white shadow-xl' : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            <TerminalIcon size={14} /> Output Console
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              activeTab === 'analytics' ? 'bg-white/10 text-white shadow-xl' : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            <ChartIcon size={14} /> Neural Trends
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {activeTab === 'logs' ? (
            <>
                <div className="flex-1 overflow-hidden">
                    <LogsViewer logs={logs} agentId={agent.id} />
                </div>
                {/* Command Input Field */}
                {isRunning && (
                    <div className="p-4 bg-white/5 border-t border-white/5 backdrop-blur-xl">
                        <form onSubmit={handleSendMessage} className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                                <Sparkles size={16} className="animate-pulse" />
                            </div>
                            <input 
                                type="text" 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Direct mind-link command..." 
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-16 text-xs font-bold text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/5 transition-all shadow-inner"
                            />
                            <button 
                                type="submit"
                                disabled={isSending || !message.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-primary/20"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                )}
            </>
          ) : (
            <div className="p-8 h-full flex flex-col animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black tracking-tighter text-white uppercase">Token Flux Analysis</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Telemetry data from last 60 minutes</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Efficiency Rating</p>
                      <p className="text-xl font-black text-white italic">98.4%</p>
                  </div>
              </div>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111113', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#3b82f6' }}
                      cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                    />
                    <Area type="monotone" dataKey="tokens" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTokens)" strokeWidth={4} />
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
