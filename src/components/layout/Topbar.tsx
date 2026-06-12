import { Bell, Search } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../data/DataContext';

export const Topbar = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { sourceMode } = useData();

  return (
    <header className="h-16 bg-[#02040A]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center flex-1">
        <div className="relative w-96 hidden md:block group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder={t.common.search}
            className="w-full bg-white/5 border border-white/5 focus:border-indigo-500/50 rounded-lg pl-10 pr-4 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition-all focus:bg-[#0A0F1C]/80"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex bg-[#0A0F1C] border border-white/5 rounded-lg p-0.5 mr-2">
          <div className="px-3 py-1 flex items-center gap-2 text-xs font-medium text-slate-300">
            <span className={`w-2 h-2 rounded-full ${sourceMode === 'Mock Data' ? 'bg-indigo-500' : sourceMode === 'Imported CSV Data' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            {sourceMode}
          </div>
        </div>
        <div className="flex bg-[#0A0F1C] border border-white/5 rounded-lg p-0.5">
          <button 
            onClick={toggleLanguage}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${language === 'en' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            EN
          </button>
          <button 
            onClick={toggleLanguage}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${language === 'es' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            ES
          </button>
        </div>
        
        <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#02040A]"></span>
        </button>

        <div className="h-8 w-px bg-white/10 mx-2"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden md:block">
            <div className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">Sarah Jenkins</div>
            <div className="text-xs text-slate-500">CIO & FinOps Lead</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-[#0A0F1C] flex items-center justify-center text-sm font-bold text-slate-200">
              SJ
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
