import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Settings, 
  Bell, 
  Search,
  Zap,
  Shield,
  Bot,
  Menu,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Bot, label: 'Clawdbot', path: '/clawdbot' },
    { icon: Users, label: 'Agents', path: '/agents' },
    { icon: MessageSquare, label: 'Conversations', path: '/conversations' },
    { icon: Zap, label: 'Workflows', path: '/workflows' },
    { icon: Shield, label: 'Security', path: '/security' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const sidebarClasses = `fixed left-0 top-0 h-full w-64 glass-panel border-r border-white/5 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  }`;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={sidebarClasses}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-deepblue-600 rounded-xl flex items-center justify-center shadow-lg shadow-deepblue-500/20">
              <Zap className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white uppercase">Nexus<span className="text-deepblue-500">AI</span></span>
          </div>
          <button 
            className="lg:hidden text-anthracite-400 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-deepblue-500/10 text-deepblue-400 border border-deepblue-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
                    : 'text-anthracite-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="glass-card p-4 rounded-2xl bg-gradient-to-br from-deepblue-600/20 to-transparent">
            <p className="text-xs text-anthracite-400 mb-2">Current Plan</p>
            <p className="text-sm font-semibold text-white mb-3">Enterprise Pro</p>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-deepblue-500 h-full w-3/4 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const Header = ({ onMenuClick }) => {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-20 glass-panel border-b border-white/5 flex items-center justify-between px-4 lg:px-8 z-40">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-anthracite-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-anthracite-500" size={18} />
          <input 
            type="text" 
            placeholder="Search agents, tasks or logs..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-deepblue-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        <button className="relative text-anthracite-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-deepblue-500 rounded-full border-2 border-anthracite-950" />
        </button>
        
        <div className="h-8 w-[1px] bg-white/10 hidden xs:block" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden xs:block">
            <p className="text-sm font-semibold text-white">Noam Agent</p>
            <p className="text-xs text-anthracite-400">Admin</p>
          </div>
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-tr from-anthracite-800 to-anthracite-700 border border-white/10 flex items-center justify-center overflow-hidden">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Noam" 
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 selection:bg-deepblue-500/30">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="lg:pl-64 pt-20 transition-all duration-300">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
