import type { OptimizationRecommendation, ExecutiveKpi, PlatformSummary, Platform } from '../types';

export const calculateKpis = (data: OptimizationRecommendation[]): ExecutiveKpi => {
  const totalSpend = 850000; // Simulated monthly run rate
  
  const potentialMonthlySavings = data.reduce((acc, curr) => acc + (curr.monthlySavings > 0 ? curr.monthlySavings : 0), 0);
  const annualizedSavings = potentialMonthlySavings * 12;
  
  // Risk adjusted: Low = 90%, Medium = 60%, High = 20%
  const riskAdjustedSavings = data.reduce((acc, curr) => {
    if (curr.monthlySavings <= 0) return acc;
    const factor = curr.riskLevel === 'Low' ? 0.9 : curr.riskLevel === 'Medium' ? 0.6 : 0.2;
    return acc + (curr.monthlySavings * factor);
  }, 0);

  const hybridWasteScore = Math.min(100, Math.round((potentialMonthlySavings / totalSpend) * 100 * 1.5)); // Exaggerated for effect
  
  const quickWinsCount = data.filter(d => d.status === 'Quick Win').length;
  const resourcesWithoutOwner = data.filter(d => !d.owner).length;

  const storageWasteTotal = data.filter(d => ['NetApp', 'Pure Storage', 'SharePoint'].includes(d.platform))
    .reduce((acc, curr) => acc + (curr.monthlySavings > 0 ? curr.monthlySavings : 0), 0);
    
  const backupWasteTotal = data.filter(d => d.platform === 'Rubrik')
    .reduce((acc, curr) => acc + (curr.monthlySavings > 0 ? curr.monthlySavings : 0), 0);
    
  const sharePointWasteTotal = data.filter(d => d.platform === 'SharePoint')
    .reduce((acc, curr) => acc + (curr.monthlySavings > 0 ? curr.monthlySavings : 0), 0);

  return {
    monthlyInfrastructureSpend: totalSpend,
    potentialMonthlySavings,
    annualizedSavings,
    riskAdjustedSavings,
    hybridWasteScore,
    quickWinsCount,
    resourcesWithoutOwner,
    storageWasteTotal,
    backupWasteTotal,
    sharePointWasteTotal
  };
};

export const calculatePlatformSummaries = (data: OptimizationRecommendation[]): PlatformSummary[] => {
  const platforms: Platform[] = ["Azure", "VMware", "Oracle VM", "NetApp", "Pure Storage", "Rubrik", "SharePoint"];
  
  // Base simulated spend per platform
  const baseSpends: Record<Platform, number> = {
    "Azure": 250000,
    "VMware": 180000,
    "Oracle VM": 120000,
    "NetApp": 80000,
    "Pure Storage": 90000,
    "Rubrik": 60000,
    "SharePoint": 70000
  };

  return platforms.map(p => {
    const pData = data.filter(d => d.platform === p);
    const potentialSavings = pData.reduce((acc, curr) => acc + (curr.monthlySavings > 0 ? curr.monthlySavings : 0), 0);
    const estimatedWaste = potentialSavings * 1.2; // Waste is slightly more than recoverable savings
    
    let sourceMode: any = "API Future";
    if (["Azure", "NetApp", "SharePoint"].includes(p)) sourceMode = "CSV Ready";
    else if (p === "Pure Storage") sourceMode = "Mock Data";

    const hasHighRisk = pData.some(d => d.riskLevel === 'High');
    const hasMediumRisk = pData.some(d => d.riskLevel === 'Medium');
    const riskLevel = hasHighRisk ? 'High' : hasMediumRisk ? 'Medium' : 'Low';

    return {
      platform: p,
      monthlySpend: baseSpends[p],
      estimatedWaste,
      potentialSavings,
      wasteScore: Math.round((estimatedWaste / baseSpends[p]) * 100),
      riskLevel,
      recommendationCount: pData.length,
      dataFreshness: '2 hours ago',
      sourceMode
    };
  });
};
