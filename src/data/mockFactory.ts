import type { OptimizationRecommendation, Platform, RiskLevel, RecommendationStatus, ActionType, ProductionImpact } from '../types';

const owners = [
  "Sarah Jenkins", "Michael Chen", "Elena Rodriguez", "David Kim", "James Wilson", 
  "Anna Nowak", "Carlos Gomez", "Priya Patel", "John Smith", "Maria Garcia",
  "Robert Taylor", "Linda Martinez", "William Anderson", "Elizabeth Thomas", "Richard Jackson"
];
const countries = ["Mexico", "Brazil", "Colombia", "Argentina", "Chile", "Peru", "United States", "India", "Spain"];
const businessUnits = ["Finance", "HR", "Sales", "Operations", "IT", "Supply Chain", "Data & Analytics", "Customer Service"];

let idCounter = 1;

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomOwner = (missingProbability: number = 0.15) => Math.random() < missingProbability ? null : getRandomElement(owners);
// Generate realistic financial numbers with decimals (cents)
const getRandomNumber = (min: number, max: number) => {
  const num = Math.random() * (max - min) + min;
  return Number(num.toFixed(2));
};

const getRandomTags = (platform: Platform): string[] => {
  const envs = ["env:prod", "env:dev", "env:staging", "env:dr"];
  const apps = ["app:billing", "app:erp", "app:crm", "app:analytics", "app:web"];
  const costCenters = ["cc:1001", "cc:2004", "cc:3099", "cc:8012"];
  
  const tags = [getRandomElement(envs), getRandomElement(apps), getRandomElement(costCenters)];
  if (platform === 'Azure' || platform === 'VMware') tags.push(`os:${Math.random() > 0.5 ? 'linux' : 'windows'}`);
  return tags;
};

const generateRecommendation = (
  platform: Platform,
  resourceNamePrefix: string,
  resourceType: string,
  issue: string,
  evidence: string,
  actionType: ActionType,
  recommendedAction: string,
  riskLevel: RiskLevel,
  savingsMin: number,
  savingsMax: number,
  requiresChange: boolean,
  productionImpact: ProductionImpact,
  isProduction: boolean
): OptimizationRecommendation => {
  const monthlySavings = getRandomNumber(savingsMin, savingsMax);
  const owner = getRandomOwner(issue.includes("governance") || issue.includes("owner") ? 1.0 : 0.15);
  let status: RecommendationStatus = "Needs Validation";
  if (!owner) status = "Owner Missing";
  else if (!requiresChange && riskLevel === "Low") status = "Quick Win";
  else if (Math.random() > 0.8) status = "Approved";

  return {
    id: `REC-${idCounter++}`,
    platform,
    resourceName: `${resourceNamePrefix}-${getRandomNumber(100, 999)}`,
    resourceType,
    issue,
    evidence,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    riskLevel,
    actionType,
    owner,
    country: getRandomElement(countries),
    businessUnit: getRandomElement(businessUnits),
    status,
    confidence: getRandomNumber(75, 100),
    recommendedAction,
    requiresChange,
    productionImpact,
    isProduction,
    tags: getRandomTags(platform)
  };
};

export const generateMockData = (): OptimizationRecommendation[] => {
  const recommendations: OptimizationRecommendation[] = [];

  // Azure (30 resources)
  for (let i = 0; i < 10; i++) recommendations.push(generateRecommendation("Azure", "AZ-VM", "Virtual Machine", "oversized candidate", "CPU promedio menor a 10%", "Rightsize", "Right-size to smaller instance", "Medium", 50, 500, true, "Low", true));
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("Azure", "AZ-Disk", "Managed Disk", "unattached disk", "Unattached disk", "Cleanup", "Delete unattached disk", "Low", 20, 150, false, "None", false));
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("Azure", "AZ-Snap", "Snapshot", "snapshot > 30 days", "Snapshot mayor a 30 días", "Cleanup", "Delete old snapshot", "Low", 10, 80, false, "None", false));
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("Azure", "AZ-DB", "SQL Database", "missing owner tag", "Missing owner tag", "Tagging", "Add owner tags", "Low", 0, 0, false, "None", true));
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("Azure", "AZ-Dev", "Virtual Machine", "dev/test always on", "Dev/test always on", "Schedule", "Schedule auto-shutdown", "Medium", 100, 300, true, "None", false));

  // VMware (30 VMs)
  for (let i = 0; i < 10; i++) recommendations.push(generateRecommendation("VMware", "VMW-Host", "Virtual Machine", "powered off with allocated disk", "Powered off VM with allocated disk", "Cleanup", "Delete or archive VM", "Low", 40, 200, false, "None", false));
  for (let i = 0; i < 10; i++) recommendations.push(generateRecommendation("VMware", "VMW-Prod", "Virtual Machine", "overallocated CPU/RAM", "CPU/RAM overallocated", "Rightsize", "Reduce allocated vCPU/RAM", "Medium", 80, 400, true, "Low", true));
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("VMware", "VMW-Snap", "Snapshot", "snapshot > 30 days", "Snapshot mayor a 30 días", "Cleanup", "Delete old snapshot", "Low", 20, 100, false, "None", false));
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("VMware", "VMW-Tpl", "Template", "duplicate template", "Template duplicado", "Cleanup", "Delete duplicate template", "Low", 10, 50, false, "None", false));

  // Oracle VM (12 workloads)
  for (let i = 0; i < 4; i++) recommendations.push(generateRecommendation("Oracle VM", "ORA-Legacy", "Virtual Machine", "legacy workload low activity", "Legacy workload con baja actividad", "Review", "Retire or consolidate", "High", 200, 800, true, "Medium", true));
  for (let i = 0; i < 4; i++) recommendations.push(generateRecommendation("Oracle VM", "ORA-DB", "Virtual Machine", "overallocated CPU/RAM", "Overallocated CPU/RAM", "Rightsize", "Reduce resource allocation", "Medium", 150, 500, true, "Low", true));
  for (let i = 0; i < 4; i++) recommendations.push(generateRecommendation("Oracle VM", "ORA-Store", "Storage", "allocated without use", "Storage asignado sin uso", "Cleanup", "Reclaim storage", "Low", 50, 200, false, "None", false));

  // NetApp (20 volumes)
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("NetApp", "NA-Vol", "Volume", "cold volume", "Cold volume", "Archive", "Tier to object storage", "Low", 100, 400, true, "None", true));
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("NetApp", "NA-Snap", "Snapshot", "snapshots older than policy", "Snapshots older than policy", "Cleanup", "Delete old snapshots", "Low", 50, 150, false, "None", true));
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("NetApp", "NA-Util", "Volume", "low utilization volume", "Low utilization volume", "Rightsize", "Resize volume", "Medium", 80, 250, true, "Low", true));
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("NetApp", "NA-Share", "CIFS/NFS Share", "share without owner", "Share without owner", "Tagging", "Assign owner to share", "Low", 0, 0, false, "None", false));

  // Pure Storage (15 volumes)
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("Pure Storage", "PURE-Vol", "Volume", "volume with no I/O", "Volume with no I/O", "Cleanup", "Delete inactive volume", "Low", 200, 600, false, "None", false));
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("Pure Storage", "PURE-Host", "Host", "disconnected host", "Disconnected host", "Review", "Investigate host connectivity", "Low", 0, 0, false, "None", false));
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("Pure Storage", "PURE-Snap", "Snapshot", "excessive snapshots", "Excessive snapshots", "Cleanup", "Delete excess snapshots", "Low", 50, 300, false, "None", true));

  // Rubrik (25 protected objects)
  for (let i = 0; i < 10; i++) recommendations.push(generateRecommendation("Rubrik", "RUB-SLA", "Protected Object", "excessive retention", "Excessive retention", "Retention", "Adjust SLA domain", "Medium", 80, 200, true, "None", true));
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("Rubrik", "RUB-Dev", "Protected Object", "dev/test with production SLA", "Dev/test protected with production SLA", "Retention", "Downgrade SLA domain", "Low", 40, 100, true, "None", false));
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("Rubrik", "RUB-Ret", "Protected Object", "retired workload still protected", "Retired workload still protected", "Cleanup", "Remove from SLA domain", "Low", 20, 80, false, "None", false));
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("Rubrik", "RUB-Crit", "Protected Object", "critical workload without backup", "Critical workload without backup", "Review", "Assign SLA domain", "High", 0, 0, true, "High", true)); // 0 savings, but high risk

  // SharePoint / M365 (25 sites)
  for (let i = 0; i < 10; i++) recommendations.push(generateRecommendation("SharePoint", "SP-Site", "Site Collection", "inactive site", "Inactive site", "Archive", "Archive inactive site", "Low", 10, 50, false, "None", false));
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("SharePoint", "SP-Ver", "Document Library", "excessive version history", "Excessive version history", "Cleanup", "Trim version history", "Low", 5, 20, false, "None", false));
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("SharePoint", "SP-Own", "Site Collection", "orphaned owner", "Orphaned owner", "Tagging", "Assign new site owner", "Low", 0, 0, false, "None", false));
  for (let i = 0; i < 5; i++) recommendations.push(generateRecommendation("SharePoint", "SP-Teams", "Teams Site", "abandoned Teams site", "Abandoned Teams site", "Archive", "Archive Teams site", "Low", 15, 60, false, "None", false));

  return recommendations;
};

export const recommendationsData = generateMockData();
