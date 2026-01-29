import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar as MainSidebar } from '../components/DashboardLayout';
import Sidebar from '../components/Sidebar';
import MainPanel from '../components/MainPanel';
import Header from '../components/Header';
import UsageChart from '../components/UsageChart';
import { useWebSocket } from '../hooks/useWebSocket';
import { Activity, Zap, Cpu, CircleDot } from 'lucide-react';
import { Grid, Box } from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [notification, setNotification] = useState(null);
  
  const { isConnected, subscribe } = useWebSocket();

  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/agents`);
      const data = await response.json();
      setAgents(data);
      
      if (selectedAgent) {
        const updated = data.find(a => a.id === selectedAgent.id);
        if (updated) {
          setSelectedAgent(updated);
        }
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedAgent]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/agents/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchLogs = useCallback(async (agentId) => {
    try {
      const response = await fetch(`${API_URL}/api/agents/${agentId}/logs`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    fetchStats();
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      fetchLogs(selectedAgent.id);
    } else {
      setLogs([]);
    }
  }, [selectedAgent, fetchLogs]);

  useEffect(() => {
    const unsubscribers = [];

    if (subscribe) {
      unsubscribers.push(
        subscribe('agent-started', (agent) => {
          setAgents(prev => {
            if (prev.find(a => a.id === agent.id)) {
              return prev.map(a => a.id === agent.id ? agent : a);
            }
            return [agent, ...prev];
          });
          fetchStats();
        })
      );

      unsubscribers.push(
        subscribe('agent-updated', (agent) => {
          setAgents(prev => prev.map(a => a.id === agent.id ? agent : a));
          if (selectedAgent?.id === agent.id) {
            setSelectedAgent(agent);
          }
          fetchStats();
        })
      );

      unsubscribers.push(
        subscribe('session-started', (session) => {
          setAgents(prev => {
            if (prev.find(a => a.id === session.id)) {
              return prev.map(a => a.id === session.id ? session : a);
            }
            return [session, ...prev];
          });
          fetchStats();
        })
      );

      unsubscribers.push(
        subscribe('session-updated', (data) => {
          const session = data.session;
          setAgents(prev => prev.map(a => a.id === session.id ? session : a));
          if (selectedAgent?.id === session.id) {
            setSelectedAgent(session);
          }
          fetchStats();
        })
      );

      unsubscribers.push(
        subscribe('session-completed', (session) => {
          setAgents(prev => prev.map(a => a.id === session.id ? session : a));
          if (selectedAgent?.id === session.id) {
            setSelectedAgent(session);
          }
          fetchStats();
        })
      );

      unsubscribers.push(
        subscribe('log-update', (data) => {
          if (selectedAgent?.id === data.agentId) {
            setLogs(prev => [...prev, data.log]);
          }
        })
      );

      unsubscribers.push(
        subscribe('logs-cleared', (data) => {
          if (selectedAgent?.id === data.agentId) {
            setLogs([]);
          }
        })
      );
    }

    return () => {
      unsubscribers.forEach(unsub => unsub && unsub());
    };
  }, [subscribe, selectedAgent, fetchStats]);

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
  };

  const activeAgentsCount = agents.filter(a => a.status === 'running' || a.status === 'starting' || a.status === 'active').length;
  const totalTokens = agents.reduce((acc, a) => {
    const tin = a.tokensIn || a.inputTokens || 0;
    const tout = a.tokensOut || a.outputTokens || 0;
    return acc + tin + tout;
  }, 0);
  const totalCost = totalTokens * 0.00002; // Rough estimation

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-4 min-h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-deepblue-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-deepblue-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-anthracite-400 font-medium animate-pulse text-sm uppercase tracking-widest">Initialising Pro Dashboard</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] overflow-hidden">
      <Sidebar
        agents={agents}
        selectedAgent={selectedAgent}
        onSelectAgent={handleSelectAgent}
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden ml-4">
        <Header 
          stats={{
            activeAgents: activeAgentsCount,
            totalTokens,
            totalCost: totalCost.toFixed(4)
          }}
          isConnected={isConnected}
        />
        
        <div className="flex-1 overflow-auto p-4 space-y-6">
          {!selectedAgent && stats && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <UsageChart 
                  title="Daily Token Usage" 
                  data={stats.dailyUsage} 
                  type="bar"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <UsageChart 
                  title="24h Activity (Hourly)" 
                  data={stats.hourlyUsage} 
                  type="area" 
                />
              </Grid>
            </Grid>
          )}

          <MainPanel
            agent={selectedAgent}
            logs={logs}
            onRefresh={fetchAgents}
            agents={agents}
          />
        </div>
      </main>

      {/* Connection Status Overlay */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 z-50 glass px-4 py-2 rounded-lg flex items-center gap-2 border border-red-500/50 bg-red-500/10">
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-xs font-bold text-red-400 uppercase tracking-tighter">Gateway Offline</span>
        </div>
      )}
    </div>
  );
}
