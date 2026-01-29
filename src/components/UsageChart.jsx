import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Card, Typography, Box, useTheme } from '@mui/material';

export const UsageChart = ({ data, title, type = 'line', dataKey = 'totalTokens' }) => {
  const theme = useTheme();
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 border border-primary/20 rounded-lg shadow-xl">
          <p className="text-xs font-bold text-primary mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium">
              <span style={{ color: entry.color }}>{entry.name}: </span>
              {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body2" color="text.secondary">No data available</Typography>
        </Box>
      );
    }
    if (type === 'area') {
      return (
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
          <XAxis 
            dataKey={data[0]?.date ? 'date' : 'hour'} 
            stroke={theme.palette.text.secondary}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke={theme.palette.text.secondary}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            name="Tokens"
            stroke={theme.palette.primary.main} 
            fillOpacity={1} 
            fill="url(#colorTokens)" 
            strokeWidth={2}
          />
        </AreaChart>
      );
    }

    return (
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
        <XAxis 
          dataKey={data[0]?.date ? 'date' : 'hour'} 
          stroke={theme.palette.text.secondary}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke={theme.palette.text.secondary}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="tokensIn" name="Input Tokens" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
        <Bar dataKey="tokensOut" name="Output Tokens" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} />
      </BarChart>
    );
  };

  return (
    <Card variant="outlined" sx={{ p: 2, height: 300, background: 'transparent' }}>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          {renderChart()}
        </ResponsiveContainer>
      </Box>
    </Card>
  );
};

export default UsageChart;
