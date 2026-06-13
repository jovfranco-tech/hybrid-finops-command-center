import { MainLayout } from '../components/layout/MainLayout';
import { ShieldAlert, Tag, Users, ShieldCheck, Clock, Activity, Target } from 'lucide-react';
import { KpiCard } from '../components/ui/KpiCard';
import { useLanguage } from '../i18n/LanguageContext';
import { useData } from '../data/DataContext';

export const RiskGovernance = () => {
  const { t } = useLanguage();
  const { activeData, sourceMode, dataFreshness, csvMetrics, workflowActions } = useData();

  const totalResources = activeData.length;
  const missingOwner = activeData.filter(r => !r.owner);
  const noOwnerCount = missingOwner.length;
  const ownerCoverage = Math.round(((totalResources - noOwnerCount) / totalResources) * 100) || 0;
  
  const highRisk = activeData.filter(r => r.riskLevel === 'High');
  const highRiskCount = highRisk.length;
  
  const zeroImpactSavings = activeData
    .filter(r => r.productionImpact === 'None')
    .reduce((a, c) => a + c.monthlySavings, 0);

  const totalActions = workflowActions.length;
  const completedActions = workflowActions.filter(a => a.status === 'Completed').length;
  const workflowCompletionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
  const exceptions = workflowActions.filter(a => a.status === 'Exception');
  const overdueActions = workflowActions.filter(a => a.status === 'New' || a.status === 'In Review').length; // Mock overdue as actions that are New/In Review
  const ownerResponseGap = workflowActions.filter(a => a.status === 'New').length;
  const governanceMaturityScore = Math.min(100, Math.round((ownerCoverage * 0.4) + (workflowCompletionRate * 0.6)));

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">{t.nav.risk}</h1>
          <p className="text-slate-400 mt-1 text-sm">Policy compliance, owner coverage, and operational impact analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KpiCard 
            title="Owner Coverage" 
            value={`${ownerCoverage}%`} 
            subtitle="Needs improvement" 
            icon={Users} 
            color={ownerCoverage > 90 ? 'emerald' : 'amber'} 
          />
          <KpiCard 
            title="Tagging Compliance" 
            value="82%" 
            subtitle="Target: >95%" 
            icon={Tag} 
            color="amber" 
          />
          <KpiCard 
            title="High Risk Actions" 
            value={highRiskCount.toString()} 
            subtitle="Require CAB approval" 
            icon={ShieldAlert} 
            color="rose" 
          />
          <KpiCard 
            title="Zero-Impact Savings" 
            value={`$${zeroImpactSavings.toLocaleString()}`} 
            subtitle="Ready to execute" 
            icon={ShieldCheck} 
            color="cyan" 
          />
        </div>

        {totalActions > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KpiCard 
              title="Workflow Completion" 
              value={`${workflowCompletionRate}%`} 
              subtitle={`${completedActions} of ${totalActions} actions`} 
              icon={ShieldCheck} 
              color={workflowCompletionRate > 80 ? 'emerald' : 'amber'} 
            />
            <KpiCard 
              title="Exceptions Logged" 
              value={exceptions.length.toString()} 
              subtitle="Skipped optimizations" 
              icon={ShieldAlert} 
              color={exceptions.length > 0 ? 'rose' : undefined} 
            />
            <KpiCard 
              title="Savings at Risk (Exceptions)" 
              value={`$${exceptions.reduce((acc, act) => acc + act.estimatedMonthlySavings, 0).toLocaleString()}`} 
              subtitle="Monthly savings blocked" 
              icon={ShieldAlert} 
              color="rose" 
            />
            <KpiCard 
              title="Overdue Actions" 
              value={overdueActions.toString()} 
              subtitle="Pending SLAs breached" 
              icon={Clock} 
              color={overdueActions > 0 ? 'amber' : undefined} 
            />
            <KpiCard 
              title="Owner Response Gap" 
              value={ownerResponseGap.toString()} 
              subtitle="Unacknowledged tickets" 
              icon={Activity} 
              color={ownerResponseGap > 0 ? 'amber' : undefined} 
            />
            <KpiCard 
              title="Governance Maturity" 
              value={`${governanceMaturityScore}/100`} 
              subtitle="Optimization readiness" 
              icon={Target} 
              color={governanceMaturityScore > 75 ? 'emerald' : 'amber'} 
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#050810]">
            <h3 className="text-lg font-semibold text-slate-200 mb-6">Production vs Non-Production Risk</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Production Environments</span>
                  <span className="text-rose-400 font-medium">Critical</span>
                </div>
                <div className="h-3 w-full bg-[#0B1221] rounded-full overflow-hidden">
                  <div className="h-full bg-[#F43F5E] rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Dev / Test / Staging</span>
                  <span className="text-[#10B981] font-medium">Low Risk</span>
                </div>
                <div className="h-3 w-full bg-[#0B1221] rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">DR / Backup</span>
                  <span className="text-amber-400 font-medium">Medium Risk</span>
                </div>
                <div className="h-3 w-full bg-[#0B1221] rounded-full overflow-hidden">
                  <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#050810]">
            <h3 className="text-lg font-semibold text-slate-200 mb-6">Data Source Quality</h3>
            {sourceMode === 'Mock Data' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-[#0B1221] rounded-xl border border-white/5">
                  <div>
                    <p className="text-slate-200 font-medium">Mock Data Engine</p>
                    <p className="text-xs text-slate-500">Generating deterministic test data</p>
                  </div>
                  <span className="text-indigo-400 text-sm font-medium">Active</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-[#0B1221] rounded-xl border border-white/5">
                  <div>
                    <p className="text-slate-200 font-medium">Imported CSV Data</p>
                    <p className="text-xs text-slate-500">Last sync: {dataFreshness.toLocaleString()}</p>
                  </div>
                  <span className="text-[#10B981] text-sm font-medium">Healthy</span>
                </div>
                {csvMetrics && csvMetrics.ownerCoverage < 90 && (
                  <div className="flex justify-between items-center p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    <div>
                      <p className="text-rose-400 font-medium text-sm">Data Quality Caveat</p>
                      <p className="text-xs text-rose-500/70">Missing owner/cost center fields</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="glass-panel border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              High Risk Workloads
            </h3>
            <div className="space-y-4">
              {highRisk.slice(0, 4).map(r => (
                <div key={r.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-200 text-sm">{r.resourceName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{r.issue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">${r.monthlySavings.toLocaleString()}/mo</p>
                    <p className="text-[10px] text-slate-500">{r.platform}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 border border-white/10 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors">
              View All High Risk Instances
            </button>
          </div>

          <div className="glass-panel border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Governance & Action Plan
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <h4 className="text-sm font-semibold text-indigo-300 mb-1">Tagging Compliance Alert</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {missingOwner.length} resources are completely untagged, blocking automated FinOps chargebacks. Total hidden waste: 
                  <span className="font-bold text-slate-200"> ${missingOwner.reduce((a,b)=>a+b.monthlySavings,0).toLocaleString()}/mo</span>.
                </p>
              </div>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <h4 className="text-sm font-semibold text-emerald-400 mb-1">Zero-Downtime Execution</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {activeData.filter(r => r.productionImpact === 'None').length} optimizations can be safely executed during business hours. 
                  Expected risk-free recovery: <span className="font-bold text-slate-200">${activeData.filter(r => r.productionImpact === 'None').reduce((a,b)=>a+b.monthlySavings,0).toLocaleString()}</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
