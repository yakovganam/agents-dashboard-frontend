import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function UsageChart({ title, data, type = 'bar', color = '#3b82f6' }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass p-8 rounded-[2rem] border-white/5 h-full flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground opacity-30">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        </div>
        <div>
            <h3 className="text-sm font-black text-white/50 uppercase tracking-[0.2em]">{title}</h3>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-bold opacity-40">No telemetry data available</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-4 border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
            <p className="text-lg font-black text-white">{(payload[0].value).toLocaleString()}</p>
          </div>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Total Tokens</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass p-6 rounded-[2rem] border-white/5 h-full flex flex-col group relative overflow-hidden transition-all duration-500 hover:border-white/10 hover:shadow-2xl">
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] -mr-16 -mt-16 opacity-20 transition-all duration-700 group-hover:scale-150 group-hover:opacity-30`} style={{ backgroundColor: color }}></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-1">{title}</h3>
          <p className="text-lg font-black text-white tracking-tighter uppercase italic">Flux Monitor</p>
        </div>
        <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-white/20"></div>
            <div className="w-1 h-1 rounded-full bg-white/40"></div>
            <div className="w-1 h-1 rounded-full bg-white/60"></div>
        </div>
      </div>

      <div className="flex-1 min-h-[220px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.03} vertical={false} />
              <XAxis 
                dataKey={data[0]?.date ? "date" : "hour"} 
                stroke="#64748b" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
                tickFormatter={(val) => data[0]?.date ? val.split('-').slice(1).join('/') : val}
              />
              <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
              <Bar dataKey="totalTokens" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={color} fillOpacity={0.6 + (index / data.length) * 0.4} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`colorUsage-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.03} vertical={false} />
              <XAxis 
                dataKey={data[0]?.date ? "date" : "hour"} 
                stroke="#64748b" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
                dy={10} 
              />
              <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="totalTokens" 
                stroke={color} 
                fillOpacity={1} 
                fill={`url(#colorUsage-${title})`} 
                strokeWidth={3}
                animationDuration={1500}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
