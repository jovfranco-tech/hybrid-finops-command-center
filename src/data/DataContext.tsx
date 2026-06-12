import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { OptimizationRecommendation, SourceMode } from '../types';
import { recommendationsData as initialMockData } from './mockFactory';

interface DataContextType {
  sourceMode: SourceMode;
  setSourceMode: (mode: SourceMode) => void;
  activeData: OptimizationRecommendation[];
  csvData: OptimizationRecommendation[];
  uploadCsvData: (data: OptimizationRecommendation[]) => void;
  clearCsvData: () => void;
  dataFreshness: Date;
  csvMetrics: {
    totalRows: number;
    ownerCoverage: number;
    platforms: string[];
    dataQuality: 'Good' | 'Partial' | 'Poor';
  } | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [sourceMode, setSourceMode] = useState<SourceMode>('Mock Data');
  const [csvData, setCsvData] = useState<OptimizationRecommendation[]>([]);
  const [dataFreshness, setDataFreshness] = useState<Date>(new Date());

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('finops_imported_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // eslint-disable-next-line
          setCsvData(parsed);
          const savedMode = localStorage.getItem('finops_source_mode') as SourceMode;
           
          if (savedMode) setSourceMode(savedMode);
        }
      }
    } catch (e) {
      console.error('Failed to load CSV data from local storage', e);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (csvData.length > 0) {
      localStorage.setItem('finops_imported_data', JSON.stringify(csvData));
    } else {
      localStorage.removeItem('finops_imported_data');
    }
    localStorage.setItem('finops_source_mode', sourceMode);
    // eslint-disable-next-line
    setDataFreshness(new Date());
  }, [csvData, sourceMode]);

  const uploadCsvData = (data: OptimizationRecommendation[]) => {
    // If we already have data, we might want to append or merge, but for this version
    // we will simply append new data to existing CSV data.
    setCsvData(prev => [...prev, ...data]);
    setSourceMode('Imported CSV Data');
  };

  const clearCsvData = () => {
    setCsvData([]);
    setSourceMode('Mock Data');
  };

  const getActiveData = (): OptimizationRecommendation[] => {
    if (sourceMode === 'Mock Data') return initialMockData;
    if (sourceMode === 'Imported CSV Data') return csvData;
    // Hybrid Mode
    return [...initialMockData, ...csvData];
  };

  const activeData = getActiveData();

  const calculateDataQuality = (coverage: number): 'Good' | 'Partial' | 'Poor' => {
    if (coverage >= 80) return 'Good';
    if (coverage >= 40) return 'Partial';
    return 'Poor';
  };

  const csvMetrics = csvData.length > 0 ? {
    totalRows: csvData.length,
    ownerCoverage: Math.round((csvData.filter(d => !!d.owner).length / csvData.length) * 100),
    platforms: Array.from(new Set(csvData.map(d => d.platform))),
    dataQuality: calculateDataQuality(Math.round((csvData.filter(d => !!d.owner).length / csvData.length) * 100))
  } : null;

  return (
    <DataContext.Provider value={{
      sourceMode,
      setSourceMode,
      activeData,
      csvData,
      uploadCsvData,
      clearCsvData,
      dataFreshness,
      csvMetrics
    }}>
      {children}
    </DataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
