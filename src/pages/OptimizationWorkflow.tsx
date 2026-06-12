import { useState, useMemo } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useData } from '../data/DataContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Activity, CheckCircle, Clock, AlertTriangle, ArrowRight, DollarSign, ListTodo } from 'lucide-react';
import type { OptimizationAction } from '../types';
import { ActionDetailDrawer } from '../components/workflow/ActionDetailDrawer';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#64748b'];

export const OptimizationWorkflow = () => {
  const { workflowActions } = useData();
  const [selectedAction, setSelectedAction] = useState<OptimizationAction | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const stats = useMemo(() => {
    let estMonthly = 0;
    let approvedMonthly = 0;
    let completedMonthly = 0;
    let exceptions = 0;
    let pendingApproval = 0;

    workflowActions.forEach(a => {
      estMonthly += a.estimatedMonthlySavings;
      if (a.status === 'Approved' || a.status === 'Scheduled' || a.status === 'Completed') {
        approvedMonthly += (a.approvedMonthlySavings || a.estimatedMonthlySavings);
      }
      if (a.status === 'Completed') {
        completedMonthly += (a.approvedMonthlySavings || a.estimatedMonthlySavings);
      }
      if (a.status === 'Exception') exceptions++;
      if (a.status === 'In Review') pendingApproval += a.estimatedMonthlySavings;
    });

    return { estMonthly, approvedMonthly, completedMonthly, exceptions, pendingApproval };
  }, [workflowActions]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    workflowActions.forEach(a => counts[a.status] = (counts[a.status] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [workflowActions]);

  const platformData = useMemo(() => {
    const counts: Record<string, number> = {};
    workflowActions.forEach(a => counts[a.platform] = (counts[a.platform] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [workflowActions]);

  const filteredActions = useMemo(() => {
    if (filterStatus === 'All') return workflowActions;
    return workflowActions.filter(a => a.status === filterStatus);
  }, [workflowActions, filterStatus]);

  return (
    <MainLayout>
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Optimization Workflow</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage optimization opportunities through approval and execution.</p>
        </div>

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass-panel p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-semibold text-slate-400 uppercase">Estimated Savings</h3>
            </div>
            <p className="text-2xl font-bold text-slate-100">${stats.estMonthly.toLocaleString()}/mo</p>
          </div>
          <div className="glass-panel p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-slate-400 uppercase">Approved Savings</h3>
            </div>
            <p className="text-2xl font-bold text-emerald-400">${stats.approvedMonthly.toLocaleString()}/mo</p>
          </div>
          <div className="glass-panel p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-semibold text-slate-400 uppercase">Completed Savings</h3>
            </div>
            <p className="text-2xl font-bold text-emerald-500">${stats.completedMonthly.toLocaleString()}/mo</p>
          </div>
          <div className="glass-panel p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-semibold text-slate-400 uppercase">Pending Approval</h3>
            </div>
            <p className="text-2xl font-bold text-amber-400">${stats.pendingApproval.toLocaleString()}/mo</p>
          </div>
          <div className="glass-panel p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-semibold text-slate-400 uppercase">Exceptions</h3>
            </div>
            <p className="text-2xl font-bold text-rose-400">{stats.exceptions} Actions</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-5 rounded-2xl h-80">
            <h3 className="text-sm font-semibold text-slate-200 mb-6">Actions by Status</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '0.5rem', color: '#F8FAFC' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No actions created yet.</div>
            )}
          </div>
          <div className="glass-panel p-5 rounded-2xl h-80">
            <h3 className="text-sm font-semibold text-slate-200 mb-6">Actions by Platform</h3>
            {platformData.length > 0 ? (
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#1E293B' }}
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '0.5rem', color: '#F8FAFC' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No actions created yet.</div>
            )}
          </div>
        </div>

        {/* Action Register */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-indigo-400" />
              Action Register
            </h3>
            <div className="flex gap-2">
              <select 
                className="bg-[#050810] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
                <option value="Exception">Exception</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0B1120] text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">ID</th>
                  <th className="px-6 py-4 font-medium">Resource</th>
                  <th className="px-6 py-4 font-medium">Platform</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Owner</th>
                  <th className="px-6 py-4 font-medium text-right">Est. Savings</th>
                  <th className="px-6 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredActions.length > 0 ? filteredActions.map((action) => (
                  <tr key={action.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-500">{action.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{action.resourceName}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{action.issue}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{action.platform}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        action.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        action.status === 'Approved' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        action.status === 'Exception' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        action.status === 'In Review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {action.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{action.owner || 'Unassigned'}</td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-400">
                      ${action.estimatedMonthlySavings.toLocaleString()}/mo
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedAction(action)}
                        className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 opacity-0 group-hover:opacity-100 hover:bg-indigo-500/20 transition-all"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No actions match the current filter. Create actions from the Opportunity Board.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Detail Drawer */}
        <ActionDetailDrawer 
          action={selectedAction} 
          onClose={() => setSelectedAction(null)} 
        />
      </div>
    </MainLayout>
  );
};
