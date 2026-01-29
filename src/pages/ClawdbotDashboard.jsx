import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Button,
    Chip,
    Paper,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    TextField,
    MenuItem,
    AppBar,
    Toolbar,
    IconButton
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    CloudSync as SyncIcon,
    Dashboard as DashboardIcon
} from '@mui/icons-material';
import useClawdbotSessions from '../hooks/useClawdbotSessions';
import SessionCard from '../components/SessionCard';
import DashboardStats from '../components/DashboardStats';

/**
 * ClawdbotDashboard Component
 * Real-time dashboard for Clawdbot sessions
 */
export default function ClawdbotDashboard() {
    const [currentTab, setCurrentTab] = useState(0);
    const [selectedSession, setSelectedSession] = useState(null);
    
    const {
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
        fetchSessionLogs
    } = useClawdbotSessions();

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        
        // Update filter based on tab
        switch (newValue) {
            case 0: // All
                setFilter({});
                break;
            case 1: // Active
                setFilter({ status: 'running' });
                break;
            case 2: // Idle
                setFilter({ status: 'idle' });
                break;
            default:
                break;
        }
    };

    const handleViewDetails = (session) => {
        setSelectedSession(session);
        // TODO: Open details dialog
        console.log('View details:', session);
    };

    const handleViewLogs = async (session) => {
        const logs = await fetchSessionLogs(session.id);
        console.log('Session logs:', logs);
        // TODO: Open logs viewer
    };

    const handleKillSession = async (session) => {
        if (window.confirm(`Are you sure you want to kill session ${session.id}?`)) {
            try {
                await killSession(session.id);
            } catch (err) {
                alert(`Failed to kill session: ${err.message}`);
            }
        }
    };

    const handleRestartSession = async (session) => {
        try {
            await restartSession(session.id);
        } catch (err) {
            alert(`Failed to restart session: ${err.message}`);
        }
    };

    const activeSessions = sessions.filter(s => s.status === 'running');
    const idleSessions = sessions.filter(s => s.status === 'idle');

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* App Bar */}
            <AppBar position="static" elevation={1}>
                <Toolbar>
                    <DashboardIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Clawdbot Agents Dashboard
                    </Typography>
                    
                    {/* Connection Status */}
                    <Chip
                        icon={<SyncIcon />}
                        label={connected ? 'Connected' : 'Disconnected'}
                        color={connected ? 'success' : 'error'}
                        size="small"
                        sx={{ mr: 2 }}
                    />
                    
                    {/* Refresh Button */}
                    <IconButton color="inherit" onClick={refresh} disabled={loading}>
                        <RefreshIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3, overflow: 'auto' }}>
                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
                        {error}
                    </Alert>
                )}

                {/* Statistics */}
                <Box sx={{ mb: 4 }}>
                    <DashboardStats stats={stats} loading={loading} />
                </Box>

                {/* Tabs */}
                <Paper sx={{ mb: 3 }}>
                    <Tabs value={currentTab} onChange={handleTabChange}>
                        <Tab label={`All Sessions (${sessions.length})`} />
                        <Tab label={`Active (${activeSessions.length})`} />
                        <Tab label={`Idle (${idleSessions.length})`} />
                    </Tabs>
                </Paper>

                {/* Filters */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        select
                        label="Model"
                        size="small"
                        value={filter.model || ''}
                        onChange={(e) => setFilter({ ...filter, model: e.target.value || undefined })}
                        sx={{ minWidth: 200 }}
                    >
                        <MenuItem value="">All Models</MenuItem>
                        {stats?.models?.map(model => (
                            <MenuItem key={model} value={model}>{model}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Kind"
                        size="small"
                        value={filter.kind || ''}
                        onChange={(e) => setFilter({ ...filter, kind: e.target.value || undefined })}
                        sx={{ minWidth: 150 }}
                    >
                        <MenuItem value="">All Kinds</MenuItem>
                        <MenuItem value="direct">Direct</MenuItem>
                        <MenuItem value="group">Group</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Sort By"
                        size="small"
                        value={filter.sortBy || 'updatedAt'}
                        onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
                        sx={{ minWidth: 150 }}
                    >
                        <MenuItem value="updatedAt">Last Activity</MenuItem>
                        <MenuItem value="totalTokens">Total Tokens</MenuItem>
                        <MenuItem value="startTime">Start Time</MenuItem>
                    </TextField>
                </Box>

                {/* Sessions Grid */}
                {loading && sessions.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : sessions.length === 0 ? (
                    <Paper sx={{ p: 8, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No sessions found
                        </Typography>
                        <Typography color="text.secondary">
                            Start using Clawdbot to see sessions here
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {sessions.map((session) => (
                            <Grid item xs={12} md={6} lg={4} key={session.id}>
                                <SessionCard
                                    session={session}
                                    onViewDetails={handleViewDetails}
                                    onViewLogs={handleViewLogs}
                                    onKill={handleKillSession}
                                    onRestart={handleRestartSession}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
}
