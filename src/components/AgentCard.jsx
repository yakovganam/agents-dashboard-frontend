import React, { forwardRef } from 'react';
import { Cpu, Zap, Clock, AlertCircle, CheckCircle2, PlayCircle } from 'lucide-react';

const AgentCard = forwardRef(({ agent, selected, onClick }, ref) => {
  const getElapsedTime = () => {
    if (!agent.startTime) return '';
    const start = agent.startTime;
    const end = agent.endTime || Date.now();
    const elapsed = Math.floor((end - start) / 1000);
    if (elapsed < 60) return `${elapsed}s`;
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m`;
    return `${Math.floor(elapsed / 3600)}h ${Math.floor((elapsed % 3600) / 60)}m`;
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'running': return { icon: PlayCircle, color: 'text-blue-400', bg: 'bg-blue-400/10' };
      case 'completed': return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
      case 'error': return { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' };
      default: return { icon: Clock, color: 'text-muted-foreground', bg: 'bg-white/5' };
    }
  };

  const { icon: StatusIcon, color: statusColor, bg: statusBg } = getStatusConfig(agent.status);

  return (
    <div
      ref={ref}
      onClick={() => onClick(agent)}
      className={`group cursor-pointer p-4 rounded-xl border transition-all duration-300 ${
        selected 
          ? 'bg-primary/10 border-primary/50 shadow-lg shadow-primary/5 translate-x-1' 
          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-lg ${statusBg} ${statusColor} shrink-0`}>
            <StatusIcon size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold truncate leading-none mb-1 group-hover:text-primary transition-colors">
              {agent.label || agent.name}
            </h3>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider truncate flex items-center gap-1">
              <Cpu size={10} /> {agent.model}
            </p>
          </div>
        </div>
      </div>

      {agent.status === 'running' && (
        <div className="space-y-2 mb-3">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary animate-pulse transition-all duration-500" 
              style={{ width: `${agent.progress || 10}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
            <span className="text-primary">{agent.progress || 0}%</span>
            <span>{getElapsedTime()}</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-muted-foreground uppercase">
          <Clock size={10} /> {getElapsedTime() || '0s'}
        </div>
        
        {(agent.metrics?.tokensUsed > 0 || agent.totalTokens > 0) && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-indigo-400 uppercase">
            <Zap size={10} /> {agent.metrics?.tokensUsed || agent.totalTokens}
          </div>
        )}
        
        {(agent.metrics?.totalCost > 0 || agent.totalCost > 0) && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-[10px] font-bold text-emerald-400 uppercase">
            ${(agent.metrics?.totalCost || agent.totalCost).toFixed(4)}
          </div>
        )}
      </div>
    </div>
  );
});

export default AgentCard;
