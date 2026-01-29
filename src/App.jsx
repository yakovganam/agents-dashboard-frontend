import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ClawdbotDashboard from './pages/ClawdbotDashboard';

// Placeholder components for other routes
const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-anthracite-400">
    <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
    <p>This page is under construction.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agents" element={<Placeholder title="Agents Management" />} />
          <Route path="/conversations" element={<Placeholder title="Conversations" />} />
          <Route path="/workflows" element={<Placeholder title="Workflows" />} />
          <Route path="/security" element={<Placeholder title="Security" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
          <Route path="/clawdbot" element={<ClawdbotDashboard />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}

export default App;
