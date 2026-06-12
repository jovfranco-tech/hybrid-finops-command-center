import { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { KpiCard } from '../components/ui/KpiCard';
import { CopilotDrawer } from '../components/copilot/CopilotDrawer';
import { useData } from '../data/DataContext';
import { calculateKpis, calculatePlatformSummaries } from '../utils/calculations';
import { DollarSign, ServerCrash, Target, Activity, Bot } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, ZAxis } from 'recharts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border border-[#1E293B] shadow-2xl rounded-lg bg-[#0A0F1C]/90 backdrop-blur-md">
        <p className="text-slate-200 font-semibold mb-1 text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-slate-200 font-medium">${Number(entry.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const Dashboard = () => {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const { t } = useLanguage();
  
  const { activeData } = useData();
  const kpis = calculateKpis(activeData);
  const platformSummaries = calculatePlatformSummaries(activeData);

  const chartData = platformSummaries.map(p => ({
    name: p.platform,
    Spend: p.monthlySpend,
    Savings: p.potentialSavings,
    Waste: p.estimatedWaste
  })).sort((a, b) => b.Savings - a.Savings);

  const scatterData = platformSummaries.map(p => ({
    name: p.platform,
    x: p.potentialSavings,
    y: p.wasteScore,
    z: p.recommendationCount
  }));

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">{t.nav.dashboard}</h1>
            <p className="text-slate-400 mt-1">Hybrid IT Waste Intelligence & Optimization</p>
          </div>
          <button 
            onClick={() => setIsCopilotOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20 rounded-xl hover:bg-[#06B6D4]/20 transition-all font-medium text-sm shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <Bot className="w-4 h-4" />
            Ask FinOps Analyst
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
            title={t.kpi.monthlySpend} 
            value={`$${kpis.monthlyInfrastructureSpend.toLocaleString()}`} 
            icon={Activity}
            subtitle="Trailing 30 days"
            trend={-2.4}
            color="indigo"
          />
          <KpiCard 
            title={t.kpi.potentialSavings} 
            value={`$${kpis.potentialMonthlySavings.toLocaleString()}`} 
            icon={DollarSign}
            subtitle="Recoverable waste"
            trend={14.5}
            color="emerald"
          />
          <KpiCard 
            title={t.kpi.annualizedSavings} 
            value={`$${kpis.annualizedSavings.toLocaleString()}`} 
            icon={Target}
            subtitle="Run-rate impact"
            trend={12.1}
            color="cyan"
          />
          <KpiCard 
            title={t.kpi.wasteScore} 
            value={`${kpis.hybridWasteScore}%`} 
            icon={ServerCrash}
            subtitle="Lower is better"
            trend={-1.2}
            color="amber"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-[#1E293B]">
            <h3 className="text-lg font-semibold text-slate-200 mb-6">Spend vs Savings by Platform</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="platform" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="savings" name="Potential Savings" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Waste" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Savings" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[#1E293B]">
            <h3 className="text-lg font-semibold text-slate-200 mb-6">Risk vs Savings Matrix</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="confidence" type="number" name="Confidence %" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <YAxis dataKey="savings" type="number" name="Savings $" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                  <ZAxis dataKey="riskValue" type="number" range={[50, 400]} />
                  <Tooltip 
                    cursor={{strokeDasharray: '3 3'}}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="glass-panel p-3 border border-[#1E293B] shadow-2xl rounded-lg bg-[#0A0F1C]/90 backdrop-blur-md">
                            <p className="text-slate-200 font-semibold mb-1 text-sm">{data.resource}</p>
                            <div className="text-xs text-slate-400">Platform: <span className="text-slate-200">{data.platform}</span></div>
                            <div className="text-xs text-slate-400">Risk: <span className="text-rose-400">{data.risk}</span></div>
                            <div className="text-xs text-slate-400">Savings: <span className="text-emerald-400">${data.savings.toLocaleString()}</span></div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Platforms" data={scatterData} fill="#06B6D4" opacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      <CopilotDrawer 
        isOpen={isCopilotOpen} 
        onClose={() => setIsCopilotOpen(false)} 
      />
    </MainLayout>
  );
};
