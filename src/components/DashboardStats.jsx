import React from 'react';
import {
    Grid,
    Paper,
    Box,
    Typography,
    CircularProgress
} from '@mui/material';
import {
    PlayArrow as PlayIcon,
    Pause as PauseIcon,
    Memory as TokenIcon,
    Timer as TimerIcon,
    Category as CategoryIcon
} from '@mui/icons-material';

/**
 * Format number with K/M suffix
 */
const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
};

/**
 * Format duration in ms to human readable
 */
const formatDuration = (ms) => {
    if (!ms) return '0s';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
};

/**
 * StatCard Component
 */
function StatCard({ title, value, icon: Icon, color = 'primary', loading = false }) {
    const colorMap = {
        primary: '#2196f3',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#00bcd4',
        secondary: '#9c27b0'
    };

    const bgColor = colorMap[color] || colorMap.primary;

    return (
        <Paper 
            elevation={2} 
            sx={{ 
                p: 3, 
                height: '100%',
                background: `linear-gradient(135deg, ${bgColor}15 0%, ${bgColor}05 100%)`,
                borderLeft: `4px solid ${bgColor}`
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                    {loading ? (
                        <CircularProgress size={30} />
                    ) : (
                        <Typography variant="h4" fontWeight="bold">
                            {value}
                        </Typography>
                    )}
                </Box>
                <Box 
                    sx={{ 
                        width: 56, 
                        height: 56, 
                        borderRadius: '50%',
                        bgcolor: bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Icon sx={{ color: 'white', fontSize: 32 }} />
                </Box>
            </Box>
        </Paper>
    );
}

/**
 * DashboardStats Component
 */
export default function DashboardStats({ stats, loading = false }) {
    if (!stats && !loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                    No statistics available
                </Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Active Sessions"
                    value={loading ? '...' : stats?.activeSessions || 0}
                    icon={PlayIcon}
                    color="success"
                    loading={loading}
                />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Idle Sessions"
                    value={loading ? '...' : stats?.idleSessions || 0}
                    icon={PauseIcon}
                    color="warning"
                    loading={loading}
                />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Total Tokens"
                    value={loading ? '...' : formatNumber(stats?.totalTokens || 0)}
                    icon={TokenIcon}
                    color="primary"
                    loading={loading}
                />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Avg Session Time"
                    value={loading ? '...' : formatDuration(stats?.avgSessionDuration || 0)}
                    icon={TimerIcon}
                    color="info"
                    loading={loading}
                />
            </Grid>

            {stats?.models && stats.models.length > 0 && (
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CategoryIcon color="secondary" />
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Models in Use
                                </Typography>
                                <Typography variant="h6">
                                    {stats.models.join(', ')}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            )}
        </Grid>
    );
}
