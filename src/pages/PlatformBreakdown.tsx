import { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useData } from '../data/DataContext';
import { calculatePlatformSummaries } from '../utils/calculations';
import { HardDrive, Cloud, Database, Server, Save, LayoutGrid } from 'lucide-react';
import { RiskBadge } from '../components/ui/RiskBadge';
import { useLanguage } from '../i18n/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border border-[#1E293B] shadow-2xl rounded-lg bg-[#0A0F1C]/90 backdrop-blur-md">
        <p className="text-slate-200 font-semibold mb-1 text-sm">{label}</p>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color }} />
          <span className="text-slate-400">Waste:</span>
          <span className="text-emerald-400 font-medium">${Number(payload[0].value).toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

const iconMap: Record<string, React.ElementType> = {
  Azure: Cloud,
  VMware: Server,
  "Oracle VM": Database,
  NetApp: HardDrive,
  "Pure Storage": HardDrive,
  Rubrik: Save,
  SharePoint: LayoutGrid,
};

export const PlatformBreakdown = () => {
  const { t } = useLanguage();
  const { activeData } = useData();
  const summaries = calculatePlatformSummaries(activeData);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const chartData = summaries.map(s => ({
    platform: s.platform,
    savings: s.potentialSavings,
  })).sort((a, b) => b.savings - a.savings);

  return (
    <MainLayout>
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">{t.nav.platforms}</h1>
          <p className="text-slate-400 mt-1 text-sm">Detailed waste topology and optimization opportunities per platform</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl h-[400px]">
              <h3 className="text-lg font-semibold text-slate-200 mb-6">Savings Potential Topology</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="platform" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                  <Bar dataKey="savings" name="Potential Savings" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#6366F1' : index === 1 ? '#10B981' : '#334155'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-panel p-0 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#060913] text-slate-400 border-b border-[#1E293B]">
                  <tr>
                    <th className="px-6 py-4 font-semibold uppercase text-xs">Platform</th>
                    <th className="px-6 py-4 font-semibold uppercase text-xs">Spend (Mo)</th>
                    <th className="px-6 py-4 font-semibold uppercase text-xs">Waste</th>
                    <th className="px-6 py-4 font-semibold uppercase text-xs">Score</th>
                    <th className="px-6 py-4 font-semibold uppercase text-xs">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {summaries.map(s => {
                    const Icon = iconMap[s.platform] || LayoutGrid;
                    return (
                      <tr 
                        key={s.platform} 
                        onClick={() => setSelectedPlatform(s.platform)}
                        className="hover:bg-[#131B2F] cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#1E293B] group-hover:bg-[#334155] flex items-center justify-center transition-colors">
                            <Icon className="w-4 h-4 text-slate-300" />
                          </div>
                          <span className="font-medium text-slate-200">{s.platform}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">${s.monthlySpend.toLocaleString()}</td>
                        <td className="px-6 py-4 font-semibold text-[#10B981]">${s.potentialSavings.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                              <div className={`h-full ${s.wasteScore > 20 ? 'bg-[#F43F5E]' : 'bg-[#10B981]'}`} style={{ width: `${s.wasteScore}%` }}></div>
                            </div>
                            <span className="text-slate-400 text-xs">{s.wasteScore}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <RiskBadge level={s.riskLevel} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass-panel p-6 rounded-2xl sticky top-24">
              {selectedPlatform ? (
                <>
                  <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#6366F1]"></span>
                    {selectedPlatform} Insights
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-[#0B1221] rounded-xl border border-[#1E293B]">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Top Offender</p>
                      <p className="font-semibold text-slate-200">Idle Dev Instances</p>
                      <p className="text-sm text-[#10B981] mt-1">$12,400/mo waste</p>
                    </div>
                    <div className="p-4 bg-[#0B1221] rounded-xl border border-[#1E293B]">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Quick Win</p>
                      <p className="font-semibold text-slate-200">Delete Unattached Disks</p>
                      <p className="text-sm text-slate-400 mt-1">Zero impact • $3,200/mo</p>
                    </div>
                    <button className="w-full mt-4 py-2 border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-xl text-sm font-medium transition-colors">
                      View All Opportunities
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-500 text-center">
                  <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm">Select a platform from the table<br/>to view deep insights</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
