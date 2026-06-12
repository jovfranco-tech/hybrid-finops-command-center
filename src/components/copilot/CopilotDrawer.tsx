import { useState, useRef, useEffect } from 'react';
import { Bot, X, Sparkles, ArrowRight, Loader2, Send, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../data/DataContext';
import type { CopilotMessage, CopilotStructuredResponse } from '../../types';

export const CopilotDrawer = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { t, language } = useLanguage();
  const { activeData } = useData();
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: language === 'en' 
        ? "I'm your Hybrid FinOps Copilot. I can analyze the current telemetry, draft optimization plans, or find orphaned resources. Try asking 'Where can we save 10%?' or type your own question."
        : "Soy tu Copiloto Hybrid FinOps. Puedo analizar telemetría, diseñar planes de optimización o buscar recursos huérfanos. Prueba preguntar '¿Dónde podemos ahorrar 10%?' o escribe tu propia pregunta.",
      sourceMode: 'Deterministic'
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const fallbackDeterministic = (q: string): CopilotStructuredResponse => {
    const totalSavings = activeData.reduce((a, c) => a + c.monthlySavings, 0);
    const lowRisk = activeData.filter(r => r.riskLevel === 'Low');
    const noOwner = activeData.filter(r => !r.owner);

    if (/save.*10%|ahorrar.*10%|10%/i.test(q)) {
      return {
        summary: language === 'en' 
          ? `To save 10%, we need to recover approximately $85k/mo. I recommend starting with VMware retired VMs and Azure oversized instances.` 
          : `Para ahorrar un 10%, necesitamos recuperar aprox. $85k/mes. Recomiendo iniciar con VMs retiradas en VMware e instancias sobredimensionadas en Azure.`,
        estimatedSavings: totalSavings * 0.4,
        riskCaveats: "Ensure Azure DBs are checked before downsizing.",
        recommendedActions: ["Execute VMware Cleanup", "Downsize Azure Compute"],
        ownerFollowUps: [],
        nextSteps: ["Review 30-day plan"],
        confidence: 90,
        dataQualityNotes: "Using deterministic fallback rules."
      };
    } else if (/low(\s|-)risk|bajo.*riesgo|safe|seguro/i.test(q)) {
      return {
        summary: language === 'en'
          ? `I found ${lowRisk.length} low-risk opportunities. Most are unattached disks and old snapshots.`
          : `Encontré ${lowRisk.length} oportunidades de bajo riesgo. La mayoría son discos sin adjuntar y snapshots antiguos.`,
        estimatedSavings: lowRisk.reduce((a,c) => a + c.monthlySavings, 0),
        riskCaveats: "Zero production impact expected.",
        recommendedActions: ["Delete unattached Azure disks", "Consolidate VMware snapshots > 30 days"],
        ownerFollowUps: [],
        nextSteps: ["Auto-schedule cleanup scripts"],
        confidence: 95,
        dataQualityNotes: "Using deterministic fallback rules."
      };
    } else if (/no.*owner|without.*owner|sin.*owner|orphaned/i.test(q)) {
      return {
        summary: language === 'en'
          ? `There are ${noOwner.length} resources without owners, mostly in Azure and VMware.`
          : `Hay ${noOwner.length} recursos sin owner, principalmente en Azure y VMware.`,
        estimatedSavings: noOwner.reduce((a,c) => a + c.monthlySavings, 0),
        riskCaveats: "Do not delete orphaned resources without checking CMDB.",
        recommendedActions: ["Run tagging compliance script"],
        ownerFollowUps: ["Contact IT Operations to claim these resources"],
        nextSteps: ["Enforce IaC tagging rules"],
        confidence: 80,
        dataQualityNotes: "Using deterministic fallback rules."
      };
    }

    return {
      summary: language === 'en' 
        ? "I can't answer that definitively using the offline rules engine."
        : "No puedo responder a eso con seguridad usando el motor de reglas offline.",
      estimatedSavings: 0,
      riskCaveats: "General advice only.",
      recommendedActions: ["Ask about savings, risk, or orphaned resources"],
      ownerFollowUps: [],
      nextSteps: [],
      confidence: 50,
      dataQualityNotes: "Fallback engine has limited natural language understanding."
    };
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: CopilotMessage = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      // Summarize context to save tokens
      const contextSummary = activeData.map(r => ({
        platform: r.platform,
        name: r.resourceName,
        issue: r.issue,
        savings: r.monthlySavings,
        risk: r.riskLevel,
        owner: r.owner,
        impact: r.productionImpact
      }));

      // In a real scenario, we might want to truncate contextSummary if it's too large for the model token limit
      const payload = {
        prompt: text,
        context: contextSummary.slice(0, 100), // limit to top 100 issues for safety
        language
      };

      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const structuredResponse: CopilotStructuredResponse = await res.json();
      
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-ai',
        role: 'assistant',
        structuredResponse,
        sourceMode: 'Gemini'
      }]);

    } catch (err) {
      console.warn("Gemini API Failed. Falling back to deterministic engine.", err);
      // Fallback
      setTimeout(() => {
        const fallbackRes = fallbackDeterministic(text);
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '-ai-fallback',
          role: 'assistant',
          structuredResponse: fallbackRes,
          sourceMode: 'Deterministic'
        }]);
        setIsThinking(false);
      }, 800);
      return; // Return early so we don't set isThinking to false before the timeout
    }

    setIsThinking(false);
  };

  const MessageBubble = ({ msg }: { msg: CopilotMessage }) => {
    if (msg.role === 'user') {
      return (
        <div className="flex justify-end mb-4">
          <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-sm shadow-md">
            {msg.content}
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-start mb-6 w-full">
        <div className="bg-[#0A0F1C] border border-white/5 rounded-2xl rounded-tl-sm p-5 w-[95%] shadow-lg relative group">
          
          <div className="absolute -top-3 right-4 bg-[#050810] border border-white/10 rounded-full px-2 py-0.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {msg.sourceMode === 'Gemini' ? (
              <><Sparkles className="w-3 h-3 text-emerald-400" /><span className="text-[10px] text-emerald-400 font-medium">Gemini 2.5</span></>
            ) : (
              <><ShieldCheck className="w-3 h-3 text-indigo-400" /><span className="text-[10px] text-indigo-400 font-medium">Deterministic</span></>
            )}
          </div>

          {msg.content && (
            <p className="text-slate-300 text-sm leading-relaxed mb-3">{msg.content}</p>
          )}

          {msg.structuredResponse && (
            <div className="space-y-4">
              <p className="text-slate-200 text-sm font-medium leading-relaxed">
                {msg.structuredResponse.summary}
              </p>

              {msg.structuredResponse.estimatedSavings > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-xs text-emerald-500 uppercase font-semibold">Identified Value</span>
                  <span className="text-lg font-bold text-emerald-400">${msg.structuredResponse.estimatedSavings.toLocaleString()}/mo</span>
                </div>
              )}

              {msg.structuredResponse.recommendedActions && msg.structuredResponse.recommendedActions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-indigo-400" /> Action Plan
                  </h4>
                  <ul className="space-y-1.5">
                    {msg.structuredResponse.recommendedActions.map((act, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-indigo-500 mt-0.5">•</span> <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {msg.structuredResponse.riskCaveats && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Risk Caveats
                  </h4>
                  <p className="text-sm text-amber-200/80">{msg.structuredResponse.riskCaveats}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 right-0 w-[450px] bg-[#02040A]/95 backdrop-blur-2xl border-l border-white/10 z-50 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#060913]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">{t.copilot.title}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {isThinking && (
              <div className="flex justify-start mb-6">
                <div className="bg-[#0A0F1C] border border-white/5 rounded-2xl rounded-tl-sm p-4 shadow-lg flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span className="text-sm text-slate-400 font-medium">Analyzing telemetry...</span>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <p className="text-xs text-slate-500 font-medium mb-3 uppercase tracking-wider">Suggested Queries</p>
              <div className="flex flex-wrap gap-2">
                {t.copilot.prompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="text-xs text-left px-3 py-2 rounded-lg bg-[#0A0F1C] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/10 text-slate-300 transition-all flex items-center justify-between group"
                  >
                    {prompt}
                    <ArrowRight className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-[#060913] border-t border-white/5 shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder={t.copilot.placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full bg-[#0A0F1C] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isThinking}
                className="absolute right-2 p-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-600 mt-3 flex justify-center items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Powered by Gemini 2.5 Flash. Fallback deterministic engine available.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
