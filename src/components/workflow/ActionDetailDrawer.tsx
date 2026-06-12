import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Clock, Mail, FileText, User, MapPin, Briefcase } from 'lucide-react';
import type { OptimizationAction, WorkflowStatus } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../data/DataContext';
import { generateOwnerEmail, generateTicketDraft } from '../../utils/workflowGenerators';

interface ActionDetailDrawerProps {
  action: OptimizationAction | null;
  onClose: () => void;
}

export const ActionDetailDrawer = ({ action, onClose }: ActionDetailDrawerProps) => {
  const { language } = useLanguage();
  const { updateActionStatus } = useData();
  const [emailDraft, setEmailDraft] = useState('');
  const [ticketDraft, setTicketDraft] = useState('');
  const [exceptionReason, setExceptionReason] = useState('');
  const [isExceptionMode, setIsExceptionMode] = useState(false);

  useEffect(() => {
    if (action) {
      setEmailDraft(generateOwnerEmail(action, language));
      setTicketDraft(generateTicketDraft(action, language));
      setIsExceptionMode(false);
      setExceptionReason('');
    }
  }, [action, language]);

  if (!action) return null;

  const handleStatusChange = (status: WorkflowStatus) => {
    updateActionStatus(action.id, status, status === 'Approved' ? { approvedMonthlySavings: action.estimatedMonthlySavings, approvedAnnualSavings: action.estimatedAnnualSavings } : undefined);
    if (status !== 'Exception') {
      setIsExceptionMode(false);
    }
  };

  const handleExceptionSubmit = () => {
    if (!exceptionReason.trim()) return;
    updateActionStatus(action.id, 'Exception', { exceptionReason });
    setIsExceptionMode(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-2xl bg-[#0B1120] border-l border-white/10 h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0B1120]/95 backdrop-blur-md border-b border-white/5 p-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
                {action.id}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                action.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' :
                action.status === 'Approved' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20' :
                action.status === 'Exception' ? 'bg-rose-500/20 text-rose-400 border-rose-500/20' :
                action.status === 'In Review' ? 'bg-amber-500/20 text-amber-400 border-amber-500/20' :
                'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {action.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">{action.resourceName}</h2>
            <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
              <span className="font-medium text-slate-300">{action.platform}</span> • {action.issue}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 space-y-8">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#050810] p-4 rounded-xl border border-white/5">
              <p className="text-xs text-slate-500 mb-1">Est. Monthly Savings</p>
              <p className="text-xl font-bold text-emerald-400">${action.estimatedMonthlySavings.toLocaleString()}</p>
            </div>
            <div className="bg-[#050810] p-4 rounded-xl border border-white/5">
              <p className="text-xs text-slate-500 mb-1">Est. Annual Savings</p>
              <p className="text-xl font-bold text-emerald-400">${action.estimatedAnnualSavings.toLocaleString()}</p>
            </div>
            <div className="bg-[#050810] p-4 rounded-xl border border-white/5">
              <p className="text-xs text-slate-500 mb-1">Risk Level</p>
              <p className={`text-lg font-bold ${
                action.riskLevel === 'High' ? 'text-rose-400' :
                action.riskLevel === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
              }`}>{action.riskLevel}</p>
            </div>
            <div className="bg-[#050810] p-4 rounded-xl border border-white/5">
              <p className="text-xs text-slate-500 mb-1">Approval Risk</p>
              <p className={`text-lg font-bold ${
                action.approvalRisk === 'High' ? 'text-rose-400' :
                action.approvalRisk === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
              }`}>{action.approvalRisk}</p>
            </div>
          </div>

          {/* Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Business Context</h3>
              <div className="bg-[#1E293B]/30 rounded-xl p-4 space-y-3 border border-white/5">
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-400 w-20">Owner:</span>
                  <span className="text-slate-200 font-medium">{action.owner || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-400 w-20">BU:</span>
                  <span className="text-slate-200">{action.businessUnit}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-400 w-20">Country:</span>
                  <span className="text-slate-200">{action.country}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Action Plan</h3>
              <div className="bg-[#1E293B]/30 rounded-xl p-4 border border-white/5 h-[116px] overflow-y-auto">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {action.actionPlan}
                </p>
              </div>
            </div>
          </div>

          {/* Exceptions */}
          {action.status === 'Exception' && action.exceptionReason && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" /> Exception Reason
              </h3>
              <p className="text-sm text-rose-200/80">{action.exceptionReason}</p>
            </div>
          )}

          {isExceptionMode && (
            <div className="bg-[#1E293B]/50 border border-white/10 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">Log Exception</h3>
              <textarea 
                className="w-full bg-[#050810] border border-white/10 rounded-lg p-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                placeholder="Enter business justification for skipping this optimization..."
                rows={3}
                value={exceptionReason}
                onChange={(e) => setExceptionReason(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsExceptionMode(false)} className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200">Cancel</button>
                <button onClick={handleExceptionSubmit} className="px-3 py-1.5 text-xs font-medium bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-md">Save Exception</button>
              </div>
            </div>
          )}

          {/* Email Draft */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4" /> Owner Communication Draft
              </h3>
              <button 
                onClick={() => copyToClipboard(emailDraft)}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>
            <div className="bg-[#050810] rounded-xl p-4 border border-white/5 overflow-x-auto">
              <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap">{emailDraft}</pre>
            </div>
          </div>

          {/* Ticket Draft */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" /> ITSM Ticket Draft
              </h3>
              <button 
                onClick={() => copyToClipboard(ticketDraft)}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>
            <div className="bg-[#050810] rounded-xl p-4 border border-white/5 overflow-x-auto">
              <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap">{ticketDraft}</pre>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-[#0B1120] border-t border-white/10 p-6 flex flex-wrap gap-3 justify-end mt-auto">
          {action.status !== 'Completed' && action.status !== 'Exception' && (
            <>
              {action.status !== 'In Review' && (
                <button 
                  onClick={() => handleStatusChange('In Review')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#1E293B] text-slate-300 hover:bg-[#334155] transition-colors"
                >
                  <Clock className="w-4 h-4" /> Mark In Review
                </button>
              )}
              
              <button 
                onClick={() => setIsExceptionMode(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" /> Exception
              </button>
              
              {action.status !== 'Approved' && (
                <button 
                  onClick={() => handleStatusChange('Approved')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 transition-all"
                >
                  <CheckCircle className="w-4 h-4" /> Approve Action
                </button>
              )}
              
              {action.status === 'Approved' && (
                <button 
                  onClick={() => handleStatusChange('Completed')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <CheckCircle className="w-4 h-4" /> Mark Completed
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
