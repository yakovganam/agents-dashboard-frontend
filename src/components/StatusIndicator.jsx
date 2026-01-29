import React from 'react';
import { Box, Tooltip } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';

const statusColors = {
  running: '#4caf50',
  pending: '#ff9800',
  completed: '#2196f3',
  error: '#f44336'
};

const statusLabels = {
  running: 'Running',
  pending: 'Pending',
  completed: 'Completed',
  error: 'Error'
};

export default function StatusIndicator({ status, size = 'small', showLabel = false }) {
  const color = statusColors[status] || '#9e9e9e';
  const label = statusLabels[status] || status;
  
  const iconSize = size === 'small' ? 12 : size === 'medium' ? 16 : 20;

  const indicator = (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 0.5 
    }}>
      <CircleIcon 
        sx={{ 
          fontSize: iconSize, 
          color: color,
          animation: status === 'running' ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.5 }
          }
        }} 
      />
      {showLabel && (
        <Box sx={{ 
          fontSize: size === 'small' ? '0.75rem' : '0.875rem',
          color: 'text.secondary',
          textTransform: 'capitalize'
        }}>
          {label}
        </Box>
      )}
    </Box>
  );

  if (showLabel) {
    return indicator;
  }

  return (
    <Tooltip title={label} arrow>
      {indicator}
    </Tooltip>
  );
}
