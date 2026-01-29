import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Search, Download, Trash2, ArrowDownCircle, Terminal, Info, AlertTriangle, XCircle, Wrench, Sparkles } from 'lucide-react';

const levelConfig = {
  info: { color: 'text-blue-400', icon: Info, bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  warning: { color: 'text-amber-400', icon: AlertTriangle, bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  error: { color: 'text-red-400', icon: XCircle, bg: 'bg-red-400/10', border: 'border-red-400/20' },
  tool: { color: 'text-purple-400', icon: Wrench, bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  agent: { color: 'text-emerald-400', icon: Sparkles, bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  debug: { color: 'text-slate-500', icon: Terminal, bg: 'bg-slate-500/10', border: 'border-slate-500/20' }
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
    <div className={`group flex flex-col gap-1 mb-2 p-3 rounded-lg border ${config.border} ${config.bg} hover:bg-opacity-20 transition-all duration-200`}>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-muted-foreground opacity-50">{formatTimestamp(log.timestamp)}</span>
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${config.color} bg-white/5`}>
          <Icon size={10} />
          {log.level}
        </div>
        {log.source && (
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">{log.source}</span>
        )}
      </div>
      
      <div className="mt-1">
        {isJson ? (
          <pre className="text-xs font-mono text-foreground/90 bg-black/40 p-2 rounded border border-white/5 overflow-x-auto terminal-scroll">
            <code className="text-blue-300">{displayMessage}</code>
          </pre>
        ) : (
          <p className="text-xs font-mono text-foreground/80 leading-relaxed whitespace-pre-wrap break-all">
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
      const atBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(atBottom);
    }
  };

  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0b] border-t border-border/50">
      <div className="h-12 flex items-center justify-between px-4 border-b border-border/20 bg-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Live Terminal</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
            <input 
              type="text" 
              placeholder="Search sequence..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border border-white/5 rounded-md px-8 py-1 text-[10px] focus:outline-none focus:border-primary/50 w-48"
            />
          </div>
          <button onClick={onExport} className="p-1.5 hover:bg-white/5 rounded-md text-muted-foreground transition-colors">
            <Download size={14} />
          </button>
          <button onClick={onClear} className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-md text-muted-foreground transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 terminal-scroll relative"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <Terminal size={48} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">No output data</p>
          </div>
        ) : (
          filteredLogs.map((log, i) => (
            <LogEntry key={i} log={log} formatTimestamp={formatTimestamp} />
          ))
        )}
        <div ref={logsEndRef} />
        
        {!autoScroll && (
          <button 
            onClick={() => {
              setAutoScroll(true);
              logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="absolute bottom-6 right-8 flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl animate-bounce"
          >
            <ArrowDownCircle size={14} /> New Output
          </button>
        )}
      </div>
    </div>
  );
}
