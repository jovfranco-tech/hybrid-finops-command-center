import { MainLayout } from '../components/layout/MainLayout';
import { Download, CheckSquare } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useData } from '../data/DataContext';
import { calculateKpis } from '../utils/calculations';

export const ExecutiveReport = () => {
  const { t } = useLanguage();
  const { activeData, sourceMode, csvMetrics, workflowActions } = useData();
  const kpis = calculateKpis(activeData);
  
  const topOpportunities = [...activeData]
    .sort((a, b) => b.monthlySavings - a.monthlySavings)
    .slice(0, 5);

  const approvedSavings = workflowActions.reduce((acc, act) => {
    if (act.status === 'Approved' || act.status === 'Scheduled' || act.status === 'Completed') {
      return acc + (act.approvedMonthlySavings || act.estimatedMonthlySavings);
    }
    return acc;
  }, 0);
  const completedSavings = workflowActions.reduce((acc, act) => {
    if (act.status === 'Completed') {
      return acc + (act.approvedMonthlySavings || act.estimatedMonthlySavings);
    }
    return acc;
  }, 0);
  const pendingSavings = workflowActions.reduce((acc, act) => act.status === 'In Review' ? acc + act.estimatedMonthlySavings : acc, 0);
  const pendingActions = workflowActions.filter(a => a.status === 'In Review').slice(0, 5);
  const exceptions = workflowActions.filter(a => a.status === 'Exception');
  const ownerFollowUpList = workflowActions.filter(a => a.owner && a.status === 'New').slice(0, 5);
  const next7DaysActions = workflowActions.filter(a => a.status === 'Approved').slice(0, 5);

  const generateMarkdown = () => {
    const md = `
# Hybrid Infrastructure FinOps Report
**Generated:** ${new Date().toLocaleDateString()} • **Prepared for:** CIO Office
**Data Source:** ${sourceMode} ${csvMetrics ? `(Owner Coverage: ${csvMetrics.ownerCoverage}%)` : ''}

## Executive Summary
The current hybrid infrastructure run rate is identifying **$${kpis.potentialMonthlySavings.toLocaleString()}** in potential monthly savings.
The overall Hybrid Waste Score stands at **${kpis.hybridWasteScore}%**.
Executing zero-impact "Quick Wins" can yield immediate cost avoidance without disrupting production.

## Top 5 Savings Opportunities
${topOpportunities.map((o, i) => `${i + 1}. **${o.resourceName}** (${o.platform})
   - Issue: ${o.issue}
   - Action: ${o.recommendedAction}
   - Monthly Savings: $${o.monthlySavings.toLocaleString()}
   - Risk: ${o.riskLevel}
   - Owner: ${o.owner || 'Unassigned'}
`).join('\n')}

## Optimization Workflow Summary
- **Actions Logged:** ${workflowActions.length}
- **Approved Monthly Savings:** $${approvedSavings.toLocaleString()}
- **Completed Monthly Savings:** $${completedSavings.toLocaleString()}
- **Pending Approval Savings:** $${pendingSavings.toLocaleString()}

${pendingActions.length > 0 ? `### Top Pending Approvals
${pendingActions.map((a, i) => `${i + 1}. **${a.resourceName}** - $${a.estimatedMonthlySavings.toLocaleString()}/mo (Owner: ${a.owner || 'Unknown'})`).join('\n')}
` : ''}
${exceptions.length > 0 ? `### Exceptions Logged
${exceptions.map((a, i) => `${i + 1}. **${a.resourceName}** - ${a.exceptionReason || 'No reason provided'}`).join('\n')}
` : ''}
${ownerFollowUpList.length > 0 ? `### Owner Follow-up List
${ownerFollowUpList.map((a, i) => `${i + 1}. **${a.owner}** - ${a.resourceName} ($${a.estimatedMonthlySavings.toLocaleString()}/mo)`).join('\n')}
` : ''}
${next7DaysActions.length > 0 ? `### Next 7 Days Actions (Approved for Execution)
${next7DaysActions.map((a, i) => `${i + 1}. **${a.resourceName}** - ${a.actionPlan}`).join('\n')}
` : ''}
## 30/60/90 Day Governance Plan
- **30 Days:** Execute ${next7DaysActions.length} approved actions. Resolve ${pendingActions.length} pending approvals.
- **60 Days:** Process ${ownerFollowUpList.length} owner follow-ups. Escalate ${exceptions.length} exceptions to architecture board.
- **90 Days:** Expand workflow assignment to all missing owners and transition manual reviews to ITSM automation.
    `;
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinOps_Report_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">{t.nav.reports}</h1>
          <p className="text-slate-400 mt-1 text-sm">Board-ready markdown report generation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel border border-white/5 rounded-2xl p-6">
              <h3 className="font-bold text-slate-100 mb-4">Export Configuration</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm text-slate-300">Include Top 5 Quick Wins</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm text-slate-300">Include Risk Analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm text-slate-300">Include Platform Breakdown</span>
                </div>
              </div>
              <button 
                onClick={generateMarkdown}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20"
              >
                <Download className="w-4 h-4" />
                Download Report (.md)
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#E2E8F0] text-slate-900 rounded-lg p-10 min-h-[600px] shadow-2xl relative overflow-hidden">
              {/* Decorative document header */}
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              
              <div className="max-w-2xl mx-auto font-sans">
                <h1 className="text-4xl font-extrabold mb-2 text-slate-900">Executive FinOps Report</h1>
                <p className="text-slate-500 mb-8 border-b border-slate-300 pb-4">Generated on {new Date().toLocaleDateString()}</p>
                
                <h2 className="text-xl font-bold mt-6 mb-3 text-indigo-900">Executive Summary</h2>
                <p className="text-sm leading-relaxed mb-4">
                  The Hybrid FinOps Command Center has identified <strong>${kpis.potentialMonthlySavings.toLocaleString()}</strong> in recoverable monthly waste across hybrid infrastructure.
                </p>

                <h2 className="text-xl font-bold mt-6 mb-3 text-indigo-900">Top 3 Immediate Actions</h2>
                <ul className="space-y-3 mb-6">
                  {topOpportunities.slice(0, 3).map(opp => (
                    <li key={opp.id} className="text-sm flex justify-between border-b border-slate-200 pb-2">
                      <span><strong>{opp.platform}:</strong> {opp.issue}</span>
                      <span className="text-emerald-700 font-bold">${opp.monthlySavings.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>

                <h2 className="text-xl font-bold mt-6 mb-3 text-indigo-900">Optimization Workflow</h2>
                <ul className="space-y-2 mb-6">
                  <li className="text-sm border-b border-slate-200 pb-2">Approved Savings: <strong className="text-emerald-700">${approvedSavings.toLocaleString()}</strong></li>
                  <li className="text-sm border-b border-slate-200 pb-2">Completed Savings: <strong className="text-emerald-700">${completedSavings.toLocaleString()}</strong></li>
                  <li className="text-sm border-b border-slate-200 pb-2">Pending Approval: <strong className="text-amber-700">${pendingSavings.toLocaleString()}</strong></li>
                  <li className="text-sm border-b border-slate-200 pb-2">Exceptions Logged: <strong className="text-rose-700">{exceptions.length}</strong></li>
                </ul>

                <h2 className="text-xl font-bold mt-6 mb-3 text-indigo-900">30/60/90 Day Governance Plan</h2>
                <p className="text-sm leading-relaxed mb-2 text-slate-700">
                  <strong>30 Days:</strong> Execute {next7DaysActions.length} approved actions. Resolve {pendingActions.length} pending approvals.
                </p>
                <p className="text-sm leading-relaxed mb-2 text-slate-700">
                  <strong>60 Days:</strong> Process {ownerFollowUpList.length} owner follow-ups. Escalate {exceptions.length} exceptions.
                </p>
                <p className="text-sm leading-relaxed mb-4 text-slate-700">
                  <strong>90 Days:</strong> Expand workflow assignment to all missing owners and transition manual reviews to ITSM automation.
                </p>

                <h2 className="text-xl font-bold mt-6 mb-3 text-indigo-900">Risk Assessment</h2>
                <p className="text-sm leading-relaxed mb-4">
                  Execution of the "Quick Wins" strategy guarantees zero production impact. However, {activeData.filter(r => r.riskLevel === 'High').length} workloads are classified as High Risk and require manual engineering validation through the approval workflow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
