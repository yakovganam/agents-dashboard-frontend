import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Chip,
    Paper,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    TextField,
    MenuItem,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    CloudSync as SyncIcon
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
                setFilter({ ...filter, status: undefined });
                break;
            case 1: // Active
                setFilter({ ...filter, status: 'running' });
                break;
            case 2: // Idle
                setFilter({ ...filter, status: 'idle' });
                break;
            default:
                break;
        }
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

    const activeSessionsCount = sessions.filter(s => s.status === 'running').length;
    const idleSessionsCount = sessions.filter(s => s.status === 'idle').length;

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header Section */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                justifyContent: 'space-between',
                mb: 4,
                gap: 2
            }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
                        Clawdbot Engine
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                            icon={<SyncIcon sx={{ fontSize: '1rem !important' }} />}
                            label={connected ? 'Connected' : 'Disconnected'}
                            color={connected ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: connected ? 'success.main' : 'error.main', color: 'white' }}
                        />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            Real-time session monitoring
                        </Typography>
                    </Box>
                </Box>
                
                <Tooltip title="Refresh Data">
                    <IconButton 
                        onClick={refresh} 
                        disabled={loading}
                        sx={{ 
                            bgcolor: 'rgba(255,255,255,0.05)', 
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(244, 67, 54, 0.1)', color: '#ff8a80', border: '1px solid rgba(244, 67, 54, 0.3)' }} onClose={() => {}}>
                    {error}
                </Alert>
            )}

            {/* Statistics Section */}
            <Box sx={{ mb: 6 }}>
                <DashboardStats stats={stats} loading={loading} />
            </Box>

            {/* Tabs and Filters Section */}
            <Paper sx={{ 
                mb: 4, 
                bgcolor: 'transparent', 
                backgroundImage: 'none',
                boxShadow: 'none'
            }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Tabs 
                            value={currentTab} 
                            onChange={handleTabChange}
                            sx={{ 
                                '& .MuiTab-root': { color: 'rgba(255,255,255,0.5)', minWidth: { xs: 'auto', sm: 90 } },
                                '& .Mui-selected': { color: '#6366f1 !important' },
                                '& .MuiTabs-indicator': { bgcolor: '#6366f1' }
                            }}
                        >
                            <Tab label={`All (${sessions.length})`} />
                            <Tab label={`Active (${activeSessionsCount})`} />
                            <Tab label={`Idle (${idleSessionsCount})`} />
                        </Tabs>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Box sx={{ 
                            display: 'flex', 
                            gap: 1, 
                            flexWrap: 'wrap', 
                            justifyContent: { xs: 'flex-start', md: 'flex-end' } 
                        }}>
                            <TextField
                                select
                                label="Model"
                                size="small"
                                value={filter.model || ''}
                                onChange={(e) => setFilter({ ...filter, model: e.target.value || undefined })}
                                sx={{ 
                                    minWidth: { xs: '100%', sm: 140 },
                                    '& .MuiInputBase-root': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' },
                                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
                                }}
                            >
                                <MenuItem value="">All Models</MenuItem>
                                {stats?.models?.map(model => (
                                    <MenuItem key={model} value={model}>{model}</MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Sort By"
                                size="small"
                                value={filter.sortBy || 'updatedAt'}
                                onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
                                sx={{ 
                                    minWidth: { xs: '100%', sm: 140 },
                                    '& .MuiInputBase-root': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' },
                                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
                                }}
                            >
                                <MenuItem value="updatedAt">Activity</MenuItem>
                                <MenuItem value="totalTokens">Tokens</MenuItem>
                                <MenuItem value="startTime">Start Time</MenuItem>
                            </TextField>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Sessions Grid */}
            {loading && sessions.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#6366f1' }} />
                </Box>
            ) : sessions.length === 0 ? (
                <Box sx={{ 
                    p: 8, 
                    textAlign: 'center', 
                    bgcolor: 'rgba(255,255,255,0.02)', 
                    borderRadius: 4,
                    border: '1px dashed rgba(255,255,255,0.1)'
                }}>
                    <Typography variant="h6" color="rgba(255,255,255,0.5)" gutterBottom>
                        No sessions found
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.3)">
                        Start using Clawdbot to see sessions here
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {sessions.map((session) => (
                        <Grid item xs={12} sm={6} lg={4} key={session.id}>
                            <SessionCard
                                session={session}
                                onKill={handleKillSession}
                                onRestart={handleRestartSession}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}
