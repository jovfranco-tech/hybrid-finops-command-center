export type Platform =
  | "Azure"
  | "VMware"
  | "Oracle VM"
  | "NetApp"
  | "Pure Storage"
  | "Rubrik"
  | "SharePoint";

export type RiskLevel = "Low" | "Medium" | "High";

export type RecommendationStatus =
  | "Quick Win"
  | "Needs Validation"
  | "Change Required"
  | "Owner Missing"
  | "Approved"
  | "Completed";

export type ActionType =
  | "Cleanup"
  | "Rightsize"
  | "Archive"
  | "Tagging"
  | "Retention"
  | "Schedule"
  | "Review";

export type ProductionImpact = "None" | "Low" | "Medium" | "High";

export type SourceMode = "Mock Data" | "Imported CSV Data" | "Hybrid Mode";

export interface OptimizationRecommendation {
  id: string;
  platform: Platform;
  resourceName: string;
  resourceType: string;
  issue: string;
  evidence: string;
  monthlySavings: number;
  annualSavings: number;
  riskLevel: RiskLevel;
  actionType: ActionType;
  owner: string | null;
  country: string;
  businessUnit: string;
  status: RecommendationStatus;
  confidence: number;
  recommendedAction: string;
  requiresChange: boolean;
  productionImpact: ProductionImpact;
  isProduction: boolean;
  tags: string[];
  source?: "Mock" | "CSV" | "Hybrid";
  sourceFile?: string;
  dataQuality?: "Good" | "Partial" | "Poor";
  dataQualityNotes?: string[];
}

export interface PlatformSummary {
  platform: Platform;
  monthlySpend: number;
  estimatedWaste: number;
  potentialSavings: number;
  wasteScore: number;
  riskLevel: RiskLevel;
  recommendationCount: number;
  dataFreshness: string;
  sourceMode: SourceMode;
}

export interface ExecutiveKpi {
  monthlyInfrastructureSpend: number;
  potentialMonthlySavings: number;
  annualizedSavings: number;
  riskAdjustedSavings: number;
  hybridWasteScore: number;
  quickWinsCount: number;
  resourcesWithoutOwner: number;
  storageWasteTotal: number;
  backupWasteTotal: number;
  sharePointWasteTotal: number;
}

export interface DataSource {
  id: string;
  name: string;
  platform: Platform;
  format: string;
  status: 'Staged' | 'Ready' | 'Action Required' | 'Disconnected';
  lastSync: string;
  sourceMode: SourceMode;
}

export interface Owner {
  id: string;
  name: string;
  department: string;
}

export interface CopilotStructuredResponse {
  summary: string;
  estimatedSavings: number;
  riskCaveats: string;
  recommendedActions: string[];
  ownerFollowUps: string[];
  nextSteps: string[];
  confidence: number;
  dataQualityNotes: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  structuredResponse?: CopilotStructuredResponse;
  sourceMode?: 'Gemini' | 'Deterministic';
}

export interface ReportSection {
  title: string;
  content: string;
}
