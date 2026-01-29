import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Button,
    Chip,
    Box,
    Typography,
    LinearProgress,
    Grid,
    Avatar
} from '@mui/material';
import {
    Memory as MemoryIcon,
    QueryStats as StatsIcon,
    AccessTime as TimeIcon,
    Code as CodeIcon
} from '@mui/icons-material';

/**
 * Format session name from session key
 */
const formatSessionName = (sessionKey) => {
    if (!sessionKey) return 'Unknown Session';
    
    // Extract meaningful part from session ID
    const parts = sessionKey.split(':');
    if (parts.length > 2) {
        return parts.slice(2).join(':').substring(0, 20);
    }
    return sessionKey.substring(0, 20);
};

/**
 * Format time relative to now
 */
const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
};

/**
 * Format absolute time
 */
const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
};

/**
 * Format number with commas
 */
const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString();
};

/**
 * Get model color
 */
const getModelColor = (model) => {
    if (!model) return '#666';
    if (model.includes('claude')) return '#9c27b0';
    if (model.includes('gpt')) return '#2196f3';
    if (model.includes('gemini')) return '#ff9800';
    return '#4caf50';
};

/**
 * Get status color
 */
const getStatusColor = (status) => {
    switch (status) {
        case 'running':
            return 'success';
        case 'idle':
            return 'warning';
        case 'completed':
            return 'default';
        case 'error':
            return 'error';
        default:
            return 'default';
    }
};

/**
 * Get status icon
 */
const getStatusIcon = (status) => {
    switch (status) {
        case 'running':
            return '🟢';
        case 'idle':
            return '⏸️';
        case 'completed':
            return '✅';
        case 'error':
            return '❌';
        default:
            return '⚪';
    }
};

/**
 * SessionCard Component
 */
export default function SessionCard({ session, onViewDetails, onViewLogs, onKill, onRestart }) {
    const tokenUsage = session.contextTokens > 0
        ? (session.totalTokens / session.contextTokens) * 100
        : 0;

    const modelColor = getModelColor(session.model);
    const statusColor = getStatusColor(session.status);
    const statusIcon = getStatusIcon(session.status);

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: modelColor }}>
                        <CodeIcon />
                    </Avatar>
                }
                title={
                    <Typography variant="h6" component="div">
                        {formatSessionName(session.sessionKey || session.id)}
                    </Typography>
                }
                subheader={
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                            label={session.kind} 
                            size="small" 
                            color={session.kind === 'direct' ? 'primary' : 'secondary'}
                        />
                        <Chip 
                            label={`${statusIcon} ${session.status}`}
                            size="small"
                            color={statusColor}
                        />
                        <Chip 
                            label={session.model} 
                            size="small"
                            variant="outlined"
                        />
                    </Box>
                }
            />
            
            <CardContent sx={{ flexGrow: 1 }}>
                {/* Token Usage Progress */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            Context Usage
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {formatNumber(session.totalTokens)} / {formatNumber(session.contextTokens)}
                        </Typography>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={Math.min(tokenUsage, 100)}
                        color={tokenUsage > 80 ? 'error' : tokenUsage > 60 ? 'warning' : 'primary'}
                        sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        {tokenUsage.toFixed(1)}% used
                    </Typography>
                </Box>

                {/* Stats Grid */}
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Input
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                                {formatNumber(session.inputTokens)}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Output
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                                {formatNumber(session.outputTokens)}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Total
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                                {formatNumber(session.totalTokens)}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Timeline */}
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                        <TimeIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                        Started: {formatTime(session.startTime)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        <MemoryIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                        Last activity: {formatRelativeTime(session.lastActivity)}
                    </Typography>
                </Box>
            </CardContent>
            
            <CardActions>
                <Button 
                    size="small" 
                    onClick={() => onViewDetails && onViewDetails(session)}
                    startIcon={<StatsIcon />}
                >
                    Details
                </Button>
                <Button 
                    size="small" 
                    onClick={() => onViewLogs && onViewLogs(session)}
                >
                    Logs
                </Button>
                {session.status === 'running' && (
                    <Button 
                        size="small" 
                        color="error"
                        onClick={() => onKill && onKill(session)}
                    >
                        Kill
                    </Button>
                )}
                {session.status !== 'running' && (
                    <Button 
                        size="small" 
                        color="primary"
                        onClick={() => onRestart && onRestart(session)}
                    >
                        Restart
                    </Button>
                )}
            </CardActions>
        </Card>
    );
}
