import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Layers, Zap, ShieldAlert, FileText, Database, ListTodo } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const Sidebar = () => {
  const { t } = useLanguage();

  const menuItems = [
    { icon: LayoutDashboard, label: t.nav.dashboard, path: '/dashboard' },
    { icon: Layers, label: t.nav.platforms, path: '/platforms' },
    { icon: Zap, label: t.nav.opportunities, path: '/opportunities' },
    { icon: ListTodo, label: (t.nav as any).workflow || 'Optimization Workflow', path: '/workflow' },
    { icon: ShieldAlert, label: t.nav.risk, path: '/risk' },
    { icon: FileText, label: t.nav.reports, path: '/reports' },
    { icon: Database, label: t.nav.connectors, path: '/connectors' },
  ];

  return (
    <aside className="w-64 bg-[#02040A]/80 backdrop-blur-xl border-r border-white/5 flex flex-col h-screen sticky top-0 z-40">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <Database className="w-6 h-6 text-indigo-400 mr-3" />
        <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
          Waste Intel
        </span>
      </div>
      <nav className="flex-1 py-6 px-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
              }`
            }
          >
            <item.icon className="w-4 h-4 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-white/5">
        <div className="bg-[#0A0F1C] border border-white/5 rounded-lg p-3 text-xs flex items-center justify-between">
          <div>
            <div className="text-slate-300 font-semibold mb-0.5">Workspace</div>
            <div className="text-slate-500 truncate w-32">Global Enterprise</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
        </div>
      </div>
    </aside>
  );
};
