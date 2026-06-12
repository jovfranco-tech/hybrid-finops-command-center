import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ElementType;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan';
}

export const KpiCard = ({ title, value, icon: Icon, subtitle, trend, color = 'indigo' }: KpiCardProps) => {
  const colorStyles = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]',
  };

  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1 tracking-wide">{title}</p>
          <h3 className="text-3xl font-bold text-slate-100 tracking-tight">{value}</h3>
          
          <div className="mt-2 flex items-center gap-2">
            {trend !== undefined && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            )}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles[color]} transition-colors`}>
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};
