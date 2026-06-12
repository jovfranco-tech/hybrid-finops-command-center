import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { PlatformBreakdown } from './pages/PlatformBreakdown';
import { OpportunityBoard } from './pages/OpportunityBoard';
import { RiskGovernance } from './pages/RiskGovernance';
import { ExecutiveReport } from './pages/ExecutiveReport';
import { DataConnectors } from './pages/DataConnectors';
import { OptimizationWorkflow } from './pages/OptimizationWorkflow';
import { LanguageProvider } from './i18n/LanguageContext';
import { DataProvider } from './data/DataContext';

function App() {
  return (
    <LanguageProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/platforms" element={<PlatformBreakdown />} />
            <Route path="/opportunities" element={<OpportunityBoard />} />
            <Route path="/risk" element={<RiskGovernance />} />
            <Route path="/workflow" element={<OptimizationWorkflow />} />
            <Route path="/reports" element={<ExecutiveReport />} />
            <Route path="/connectors" element={<DataConnectors />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </DataProvider>
    </LanguageProvider>
  );
}

export default App;
