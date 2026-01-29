import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
    Search, 
    Download, 
    Trash2, 
    ArrowDownCircle, 
    Terminal, 
    Info, 
    AlertTriangle, 
    XCircle, 
    Wrench, 
    Sparkles,
    Cpu,
    Zap,
    History
} from 'lucide-react';

const levelConfig = {
  info: { color: 'text-blue-400', icon: Info, bg: 'bg-blue-400/5', border: 'border-blue-400/10' },
  warning: { color: 'text-amber-400', icon: AlertTriangle, bg: 'bg-amber-400/5', border: 'border-amber-400/10' },
  error: { color: 'text-red-400', icon: XCircle, bg: 'bg-red-400/5', border: 'border-red-400/10' },
  tool: { color: 'text-purple-400', icon: Wrench, bg: 'bg-purple-400/5', border: 'border-purple-400/10' },
  agent: { color: 'text-emerald-400', icon: Sparkles, bg: 'bg-emerald-400/5', border: 'border-emerald-400/10' },
  debug: { color: 'text-slate-500', icon: Terminal, bg: 'bg-slate-500/5', border: 'border-slate-500/10' }
};

const LogEntry = ({ log, formatTimestamp }) => {
  const config = levelConfig[log.level] || levelConfig.info;
  const Icon = config.icon;

  const isJson = useMemo(() => {
    if (typeof log.message !== 'string') return true;
    const trimmed = log.message.trim();
    return (trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'));
  }, [log.message]);

  const displayMessage = useMemo(() => {
    if (isJson) {
      try {
        const obj = typeof log.message === 'string' ? JSON.parse(log.message) : log.message;
        return JSON.stringify(obj, null, 2);
      } catch (e) {
        return log.message;
      }
    }
    return log.message;
  }, [log.message, isJson]);

  return (
    <div className={`group flex flex-col gap-2 mb-3 p-4 rounded-2xl border ${config.border} ${config.bg} hover:bg-white/5 transition-all duration-300 animate-in slide-in-from-left-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg bg-white/5 ${config.color}`}>
                <Icon size={14} />
            </div>
            <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>{log.level}</span>
                {log.source && (
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">{log.source}</span>
                )}
            </div>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground opacity-30">{formatTimestamp(log.timestamp)}</span>
      </div>
      
      <div className="relative group/content">
        {isJson ? (
          <div className="relative">
            <pre className="text-xs font-mono text-blue-300 bg-black/40 p-4 rounded-xl border border-white/5 overflow-x-auto scrollbar-hide">
                <code>{displayMessage}</code>
            </pre>
            <div className="absolute top-2 right-2 opacity-0 group-hover/content:opacity-100 transition-opacity">
                <div className="px-2 py-1 rounded bg-white/10 text-[8px] font-black text-white uppercase tracking-widest border border-white/10 backdrop-blur-md">JSON Payload</div>
            </div>
          </div>
        ) : (
          <p className="text-xs font-mono text-foreground/90 leading-relaxed whitespace-pre-wrap break-words pl-1 border-l-2 border-white/5">
            {log.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default function LogsViewer({ logs = [], agentId, onClear, onExport }) {
  const [searchTerm, setSearchTerm] = useState('');
  const logsEndRef = useRef(null);
  const containerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    const term = searchTerm.toLowerCase();
    return logs.filter(log => {
      const msg = typeof log.message === 'string' ? log.message : JSON.stringify(log.message);
      return msg.toLowerCase().includes(term) || 
             log.level?.toLowerCase().includes(term) ||
             log.source?.toLowerCase().includes(term);
    });
  }, [logs, searchTerm]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, autoScroll]);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 100;
      setAutoScroll(atBottom);
    }
  };

  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-[#050506] relative">
      {/* Glossy Header for Terminal */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-white/5 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 animate-pulse"></div>
          </div>
          <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Neural Output Stream</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={12} />
            <input 
              type="text" 
              placeholder="Search telemetry..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-xl px-9 py-1.5 text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/10 transition-all w-64"
            />
          </div>
          <div className="flex gap-1">
              <button onClick={onExport} className="p-2 hover:bg-white/10 rounded-xl text-muted-foreground transition-all">
                <Download size={16} />
              </button>
              <button onClick={onClear} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-xl text-muted-foreground transition-all">
                <Trash2 size={16} />
              </button>
          </div>
        </div>
      </div>

      {/* Main Terminal Area */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 scrollbar-hide relative"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-muted-foreground opacity-10 animate-pulse">
                <History size={40} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-20 italic">Awaiting connection signal...</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log, i) => (
              <LogEntry key={i} log={log} formatTimestamp={formatTimestamp} />
            ))}
          </div>
        )}
        <div ref={logsEndRef} className="h-4" />
        
        {!autoScroll && (
          <button 
            onClick={() => {
              setAutoScroll(true);
              logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="fixed bottom-10 right-10 flex items-center gap-3 px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/40 animate-bounce z-50 border border-white/20 backdrop-blur-xl"
          >
            <ArrowDownCircle size={16} /> Syncing Live
          </button>
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="h-8 bg-white/5 border-t border-white/5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                  <Cpu size={10} /> Node: Master-Primary
              </div>
              <div className="flex items-center gap-1.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                  <Zap size={10} /> Speed: Real-time
              </div>
          </div>
          <div className="text-[8px] font-black text-primary uppercase tracking-widest italic">
              Clawdbot Neural Core v4.5-ULTRA
          </div>
      </div>
    </div>
  );
}
