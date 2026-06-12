import { useState, useRef } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { UploadCloud, AlertCircle, Database, Cloud, Settings, Trash2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useData } from '../data/DataContext';
import { parseCSVFile } from '../utils/csvNormalizer';
import type { Platform } from '../types';

const ConnectorCard = ({ 
  title, 
  platform,
  format, 
  icon: Icon,
  onUpload
}: { 
  title: string, 
  platform: Platform,
  format: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any,
  onUpload: (file: File, platform: Platform) => void,
  sampleFile?: string
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { t } = useLanguage();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        await onUpload(file, platform);
      } catch (err) {
        console.error("Upload failed", err);
        alert(`Failed to parse CSV for ${platform}`);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#0F172A] border border-white/5 flex items-center justify-center">
            <Icon className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#1E293B] text-slate-300">
            {format}
          </span>
        </div>
        <h3 className="font-semibold text-slate-200 mb-1">{title}</h3>
        <p className="text-sm text-slate-400 mb-6">{t.connectors?.cardSubtitle || "Import normalized cost and usage telemetry."}</p>
      </div>

      <div className="pt-4 border-t border-[#1E293B] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
          >
            {isUploading ? <><UploadCloud className="w-4 h-4 animate-bounce" /> {t.connectors?.uploading || "Parsing..."}</> : <><UploadCloud className="w-4 h-4" /> {t.connectors?.uploadBtn || "Upload CSV"}</>}
          </button>
        </div>
        {sampleFile && (
          <a href={`/sample-data/${sampleFile}`} download className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Download sample CSV
          </a>
        )}
      </div>
    </div>
  );
};

export const DataConnectors = () => {
  const { t } = useLanguage();
  const { sourceMode, setSourceMode, uploadCsvData, clearCsvData, csvMetrics, dataFreshness } = useData();

  const handleUpload = async (file: File, platform: Platform) => {
    const data = await parseCSVFile(file, platform);
    uploadCsvData(data);
  };

  return (
    <MainLayout>
      <div className="w-full space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">{t.nav.connectors}</h1>
            <p className="text-slate-400 mt-1 text-sm">{t.connectors?.subtitle}</p>
          </div>
          
          <div className="flex items-center gap-2 bg-[#0A0F1C] border border-white/5 p-1 rounded-lg">
            <button
              onClick={() => setSourceMode('Mock Data')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${sourceMode === 'Mock Data' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Mock Engine
            </button>
            <button
              onClick={() => setSourceMode('Imported CSV Data')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${sourceMode === 'Imported CSV Data' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              CSV Data
            </button>
            <button
              onClick={() => setSourceMode('Hybrid Mode')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${sourceMode === 'Hybrid Mode' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Hybrid
            </button>
          </div>
        </div>

        {csvMetrics && (
          <div className="glass-panel p-6 rounded-2xl bg-indigo-900/10 border border-indigo-500/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-indigo-100 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                {t.connectors?.stagingTitle}
              </h3>
              <button 
                onClick={clearCsvData}
                className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20"
              >
                <Trash2 className="w-4 h-4" /> {t.connectors?.clearData}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#050810] p-4 rounded-xl border border-white/5">
                <p className="text-xs text-slate-500 mb-1">{t.connectors?.totalRows}</p>
                <p className="text-2xl font-bold text-slate-200">{csvMetrics.totalRows.toLocaleString()}</p>
              </div>
              <div className="bg-[#050810] p-4 rounded-xl border border-white/5">
                <p className="text-xs text-slate-500 mb-1">{t.connectors?.ownerCoverage}</p>
                <div className="flex items-end gap-2">
                  <p className={`text-2xl font-bold ${csvMetrics.ownerCoverage > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{csvMetrics.ownerCoverage}%</p>
                  {csvMetrics.ownerCoverage < 90 && <AlertCircle className="w-4 h-4 text-amber-400 mb-1.5" />}
                </div>
              </div>
              <div className="bg-[#050810] p-4 rounded-xl border border-white/5">
                <p className="text-xs text-slate-500 mb-1">{t.connectors?.platformsIngested || 'Platforms'}</p>
                <p className="text-2xl font-bold text-slate-200">{csvMetrics.platforms.length}</p>
              </div>
              <div className="bg-[#050810] p-4 rounded-xl border border-white/5">
                <p className="text-xs text-slate-500 mb-1">Data Quality</p>
                <p className={`text-2xl font-bold ${csvMetrics.dataQuality === 'Good' ? 'text-emerald-400' : csvMetrics.dataQuality === 'Partial' ? 'text-amber-400' : 'text-rose-400'}`}>
                  {csvMetrics.dataQuality}
                </p>
              </div>
              <div className="bg-[#050810] p-4 rounded-xl border border-white/5">
                <p className="text-xs text-slate-500 mb-1">{t.connectors?.lastImport}</p>
                <p className="text-sm font-medium text-slate-300 mt-1">{dataFreshness.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
          <ConnectorCard title="Azure Cost Export" platform="Azure" format="CSV" icon={Cloud} onUpload={handleUpload} sampleFile="azure-cost-export-sample.csv" />
          <ConnectorCard title="VMware Inventory" platform="VMware" format="CSV" icon={Database} onUpload={handleUpload} sampleFile="vmware-inventory-sample.csv" />
          <ConnectorCard title="Oracle VM Export" platform="Oracle VM" format="CSV" icon={Database} onUpload={handleUpload} />
          <ConnectorCard title="NetApp Volumes" platform="NetApp" format="CSV" icon={Database} onUpload={handleUpload} sampleFile="netapp-volumes-sample.csv" />
          <ConnectorCard title="Pure Storage" platform="Pure Storage" format="CSV" icon={Database} onUpload={handleUpload} sampleFile="pure-volumes-sample.csv" />
          <ConnectorCard title="Rubrik Objects" platform="Rubrik" format="CSV" icon={Database} onUpload={handleUpload} sampleFile="rubrik-objects-sample.csv" />
          <ConnectorCard title="SharePoint Sites" platform="SharePoint" format="CSV" icon={Cloud} onUpload={handleUpload} sampleFile="sharepoint-storage-sample.csv" />
          
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border-dashed border-2 border-[#1E293B] bg-transparent opacity-50">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center">
                  <Settings className="w-5 h-5 text-slate-500" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#1E293B] text-slate-500">
                  API
                </span>
              </div>
              <h3 className="font-semibold text-slate-400 mb-1">v0.3 Roadmap</h3>
              <p className="text-sm text-slate-500 mb-6">Direct API integrations with cloud providers.</p>
            </div>
            <div className="pt-4 border-t border-[#1E293B]">
              <span className="text-sm font-medium text-slate-600">{t.connectors?.comingSoon || "Coming Soon"}</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
