import { useState, useEffect, useCallback } from 'react';
import useWebSocket from './useWebSocket';

const API_BASE = import.meta.env.VITE_API_URL + '/api';

/**
 * Hook for fetching and managing Clawdbot sessions
 */
export default function useClawdbotSessions() {
    const [sessions, setSessions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({});
    
    const { connected, lastMessage } = useWebSocket();

    /**
     * Fetch sessions from API
     */
    const fetchSessions = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (filter.status) params.append('status', filter.status);
            if (filter.model) params.append('model', filter.model);
            if (filter.kind) params.append('kind', filter.kind);
            if (filter.sortBy) params.append('sortBy', filter.sortBy);
            if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);
            
            const response = await fetch(`${API_BASE}/clawdbot/sessions?${params}`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                    'bypass-tunnel-reminder': 'true'
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setSessions(data.sessions);
                setError(null);
            } else {
                setError(data.error);
            }
        } catch (err) {
            console.error('Error fetching sessions:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    /**
     * Fetch statistics
     */
    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/clawdbot/stats`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                    'bypass-tunnel-reminder': 'true'
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    }, []);

    /**
     * Fetch specific session
     */
    const fetchSession = useCallback(async (sessionId) => {
        try {
            const response = await fetch(`${API_BASE}/clawdbot/sessions/${sessionId}`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                    'bypass-tunnel-reminder': 'true'
                }
            });
            const data = await response.json();
            return data.success ? data.session : null;
        } catch (err) {
            console.error('Error fetching session:', err);
            return null;
        }
    }, []);

    /**
     * Fetch session logs
     */
    const fetchSessionLogs = useCallback(async (sessionId) => {
        try {
            const response = await fetch(`${API_BASE}/clawdbot/sessions/${sessionId}/logs`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                    'bypass-tunnel-reminder': 'true'
                }
            });
            const data = await response.json();
            return data.success ? data.logs : [];
        } catch (err) {
            console.error('Error fetching session logs:', err);
            return [];
        }
    }, []);

    /**
     * Refresh data manually
     */
    const refresh = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchSessions(), fetchStats()]);
    }, [fetchSessions, fetchStats]);

    /**
     * Kill session
     */
    const killSession = useCallback(async (sessionId) => {
        try {
            const response = await fetch(`${API_BASE}/clawdbot/sessions/${sessionId}/kill`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
                refresh();
                return true;
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error('Error killing session:', err);
            throw err;
        }
    }, [refresh]);

    /**
     * Restart session
     */
    const restartSession = useCallback(async (sessionId) => {
        try {
            const response = await fetch(`${API_BASE}/clawdbot/sessions/${sessionId}/restart`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
                refresh();
                return true;
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error('Error restarting session:', err);
            throw err;
        }
    }, [refresh]);

    /**
     * Handle WebSocket messages
     */
    useEffect(() => {
        if (!lastMessage) return;

        const { type, data } = lastMessage;

        switch (type) {
            case 'session-started':
                // Add new session to the list
                setSessions(prev => {
                    if (prev.find(s => s.id === data.id)) return prev;
                    return [data, ...prev];
                });
                fetchStats(); // Update stats
                break;

            case 'session-updated':
                // Update existing session
                setSessions(prev => 
                    prev.map(s => s.id === (data.session?.id || data.id) ? (data.session || data) : s)
                );
                break;

            case 'session-completed':
                // Update completed session
                setSessions(prev => 
                    prev.map(s => s.id === data.id ? { ...s, status: 'completed' } : s)
                );
                fetchStats(); // Update stats
                break;

            case 'log-update':
                // This event is handled by components that need live logs
                // We could dispatch a custom event or use a global store if needed
                break;

            case 'stats-updated':
                // Update statistics
                setStats(data);
                break;

            default:
                break;
        }
    }, [lastMessage, fetchStats]);

    /**
     * Initial fetch and polling setup
     */
    useEffect(() => {
        fetchSessions();
        fetchStats();

        // Poll every 10 seconds as fallback
        const interval = setInterval(() => {
            fetchSessions();
            fetchStats();
        }, 10000);

        return () => clearInterval(interval);
    }, [fetchSessions, fetchStats]);

    return {
        sessions,
        stats,
        loading,
        error,
        connected,
        filter,
        setFilter,
        refresh,
        killSession,
        restartSession,
        fetchSession,
        fetchSessionLogs
    };
}
