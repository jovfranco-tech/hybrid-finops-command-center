import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useData } from '../data/DataContext';
import { Search, AlertCircle, SearchX, Tag, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RiskBadge } from '../components/ui/RiskBadge';
import { useLanguage } from '../i18n/LanguageContext';
import { EmptyState } from '../components/ui/EmptyState';
import { CustomSelect } from '../components/ui/CustomSelect';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Quick Win': 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
    'Needs Validation': 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
    'Owner Missing': 'bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/20',
    'Approved': 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20',
    'Completed': 'bg-slate-800 text-slate-400 border-slate-700'
  };

  return (
    <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider font-semibold border ${styles[status] || styles['Needs Validation']}`}>
      {status}
    </span>
  );
};

export const OpportunityBoard = () => {
  const { t } = useLanguage();
  const { activeData, workflowActions, createAction } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;
  
  const platforms = ['All', ...Array.from(new Set(activeData.map(r => r.platform)))];

  const filteredData = useMemo(() => {
    return activeData.filter(rec => {
      const matchesSearch = 
        rec.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (rec.owner && rec.owner.toLowerCase().includes(searchTerm.toLowerCase())) ||
        rec.issue.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = filterPlatform === 'All' || rec.platform === filterPlatform;
      return matchesSearch && matchesPlatform;
    }).sort((a, b) => b.monthlySavings - a.monthlySavings);
  }, [activeData, searchTerm, filterPlatform]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Reset page when filters change
  // eslint-disable-next-line
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterPlatform]);

  return (
    <MainLayout>
      <div className="w-full space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">{t.nav.opportunities}</h1>
            <p className="text-slate-400 mt-1 text-sm">Command center for execution, validation, and remediation</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#0B1221] border border-[#1E293B] rounded-lg px-3 py-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder={t.common.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-64 text-slate-200 placeholder:text-slate-600" 
              />
            </div>
            <CustomSelect 
              value={filterPlatform}
              onChange={setFilterPlatform}
              options={platforms}
            />
          </div>
        </div>

        <div className="glass-panel border border-[#1E293B] rounded-xl overflow-hidden shadow-2xl flex flex-col h-[calc(100vh-220px)]">
          <div className="flex-1 overflow-auto relative">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-400 uppercase bg-[#060913] border-b border-[#1E293B] sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-semibold">Resource / Issue</th>
                  <th className="px-4 py-3 font-semibold">Platform & Tags</th>
                  <th className="px-4 py-3 font-semibold">Savings (Mo)</th>
                  <th className="px-4 py-3 font-semibold">Risk & Confidence</th>
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentData.map((opp, index) => {
                  const isTopSaving = currentPage === 1 && index < 3 && filterPlatform === 'All' && !searchTerm;
                  const existingAction = workflowActions.find(a => a.recommendationId === opp.id);
                  
                  return (
                  <tr key={opp.id} className={`hover:bg-white/5 transition-colors group ${isTopSaving ? 'bg-emerald-500/5' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200 flex items-center gap-2">
                        {isTopSaving && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                        {opp.resourceName}
                      </div>
                      <div className="text-slate-500 text-xs mt-1 flex items-center gap-1 truncate max-w-[250px]">
                        <AlertCircle className="w-3 h-3 text-[#F43F5E] flex-shrink-0" />
                        <span className="truncate" title={opp.evidence}>{opp.evidence}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-300 font-medium text-xs">{opp.platform}</div>
                      <div className="flex gap-1 mt-1 flex-wrap w-[180px]">
                        {opp.tags.map(tag => (
                          <span key={tag} className="text-[9px] bg-[#0A0F1C] text-slate-400 px-1.5 py-0.5 rounded border border-white/5 flex items-center gap-0.5">
                            <Tag className="w-2 h-2" /> {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`font-semibold ${opp.monthlySavings > 0 ? 'text-[#10B981]' : 'text-slate-300'}`}>
                        ${opp.monthlySavings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                      <div className="text-slate-500 text-[10px] mt-1">{opp.actionType}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        <RiskBadge level={opp.riskLevel} />
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${opp.confidence}%` }}></div>
                          </div>
                          <span className="text-[10px] text-slate-500">{opp.confidence}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={opp.owner ? "text-slate-300 text-xs" : "text-[#F43F5E] text-xs font-semibold"}>
                        {opp.owner || 'MISSING OWNER'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={opp.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {existingAction ? (
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold border ${
                            existingAction.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            existingAction.status === 'Approved' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            In Workflow: {existingAction.status}
                          </span>
                          <button 
                            onClick={() => navigate('/workflow')}
                            className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300"
                          >
                            View Pipeline <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-2">
                          <button 
                            onClick={() => createAction(opp)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap"
                          >
                            <Plus className="w-3 h-3" /> Create Action
                          </button>
                          <span className="text-[10px] text-slate-500">{opp.recommendedAction}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
            
            {filteredData.length === 0 && (
              <EmptyState 
                icon={SearchX} 
                title="No opportunities found" 
                description={`We couldn't find anything matching "${searchTerm}" in ${filterPlatform === 'All' ? 'any platform' : filterPlatform}.`} 
              />
            )}
          </div>
          
          <div className="p-4 bg-[#060913] border-t border-[#1E293B] text-xs text-slate-500 flex justify-between items-center">
            <span>Showing {currentData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} opportunities</span>
            
            <div className="flex items-center gap-4">
              <span className="font-medium text-slate-400">
                Est. recoverable: ${filteredData.reduce((acc, curr) => acc + curr.monthlySavings, 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/mo
              </span>
              
              {totalPages > 1 && (
                <div className="flex gap-1 ml-4">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 bg-[#0B1221] border border-[#1E293B] rounded hover:bg-[#131B2F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  <span className="px-2 py-1 text-slate-400">Page {currentPage} of {totalPages}</span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 bg-[#0B1221] border border-[#1E293B] rounded hover:bg-[#131B2F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
