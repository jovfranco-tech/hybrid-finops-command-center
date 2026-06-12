export interface Recommendation {
  id: string;
  title: string;
  environment: string;
  category: 'Retire' | 'Right-size' | 'Re-tier' | 'Reclaim' | 'Reserve';
  potentialSavings: number;
  risk: 'Low' | 'Medium' | 'High';
  effort: 'Low' | 'Medium' | 'High';
  owner: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  details: string;
}

export const mockRecommendations: Recommendation[] = [
  {
    id: "REC-001",
    title: "Apagar y borrar 15 VMs del proyecto 'Migración-Legacy'",
    environment: "VMware On-Prem (vCenter-01)",
    category: "Retire",
    potentialSavings: 14250,
    risk: "Low",
    effort: "Low",
    owner: "Infra Team",
    status: "Pending",
    details: "Estas VMs llevan apagadas 90 días y el datastore que ocupan está en almacenamiento costoso de Pure Storage."
  },
  {
    id: "REC-002",
    title: "Right-size 8 Oracle DB VMs (CPU underutilized)",
    environment: "Azure (US-East)",
    category: "Right-size",
    potentialSavings: 8400,
    risk: "Medium",
    effort: "Medium",
    owner: "DBA Team",
    status: "Pending",
    details: "Promedio de CPU < 15% en los últimos 45 días. Riesgo medio por ser entorno de producción."
  },
  {
    id: "REC-003",
    title: "Mover volumen 'DB-Archive' a SATA",
    environment: "NetApp FAS",
    category: "Re-tier",
    potentialSavings: 1200,
    risk: "Low",
    effort: "Low",
    owner: "Storage Team",
    status: "Pending",
    details: "No ha tenido IOPS de lectura en 45 días."
  },
  {
    id: "REC-004",
    title: "Reclamar 45 licencias M365 E5 sin uso",
    environment: "Microsoft 365",
    category: "Reclaim",
    potentialSavings: 2565,
    risk: "Low",
    effort: "Low",
    owner: "IT Ops",
    status: "Pending",
    details: "Usuarios sin inicio de sesión en los últimos 60 días."
  }
];

export const mockKpis = {
  totalPotentialSavings: 142500,
  realizedSavings: 34200,
  hybridWasteIndex: 28,
  zombieCount: 84,
  reclaimableStorageTB: 124
};

export const mockChartData = [
  { name: 'Jan', Azure: 14000, VMware: 22400, Storage: 12400 },
  { name: 'Feb', Azure: 13000, VMware: 21398, Storage: 12210 },
  { name: 'Mar', Azure: 12000, VMware: 19800, Storage: 12290 },
  { name: 'Apr', Azure: 12780, VMware: 18908, Storage: 12000 },
  { name: 'May', Azure: 11890, VMware: 14800, Storage: 11181 },
  { name: 'Jun', Azure: 11390, VMware: 13800, Storage: 10500 },
];

export const mockPlatforms = [
  {
    id: 'azure',
    name: 'Azure Compute',
    spend: 145000,
    estimatedWaste: 28000,
    potentialSavings: 25000,
    wasteScore: 19,
    riskLevel: 'Medium',
    recommendations: 12,
    freshness: '2 hours ago',
    sourceMode: 'API Ready'
  },
  {
    id: 'vmware',
    name: 'VMware On-Prem',
    spend: 85000,
    estimatedWaste: 42000,
    potentialSavings: 38000,
    wasteScore: 49,
    riskLevel: 'Low',
    recommendations: 45,
    freshness: '1 day ago',
    sourceMode: 'CSV Import'
  },
  {
    id: 'oracle',
    name: 'Oracle VM',
    spend: 60000,
    estimatedWaste: 15000,
    potentialSavings: 12000,
    wasteScore: 25,
    riskLevel: 'High',
    recommendations: 4,
    freshness: '3 hours ago',
    sourceMode: 'API Ready'
  },
  {
    id: 'netapp',
    name: 'NetApp Storage',
    spend: 40000,
    estimatedWaste: 18000,
    potentialSavings: 16000,
    wasteScore: 45,
    riskLevel: 'Low',
    recommendations: 8,
    freshness: '5 hours ago',
    sourceMode: 'API Ready'
  },
  {
    id: 'pure',
    name: 'Pure Storage',
    spend: 35000,
    estimatedWaste: 12000,
    potentialSavings: 11000,
    wasteScore: 34,
    riskLevel: 'Medium',
    recommendations: 3,
    freshness: '12 hours ago',
    sourceMode: 'Mock Data'
  },
  {
    id: 'rubrik',
    name: 'Rubrik Backup',
    spend: 25000,
    estimatedWaste: 8000,
    potentialSavings: 8000,
    wasteScore: 32,
    riskLevel: 'Low',
    recommendations: 5,
    freshness: '1 day ago',
    sourceMode: 'CSV Import'
  },
  {
    id: 'm365',
    name: 'Microsoft 365',
    spend: 120000,
    estimatedWaste: 15000,
    potentialSavings: 15000,
    wasteScore: 12,
    riskLevel: 'Low',
    recommendations: 120,
    freshness: '1 hour ago',
    sourceMode: 'API Ready'
  }
];

export const mockOpportunities = [
  {
    id: 'OPP-01',
    platform: 'VMware',
    resource: 'Project Migración-Legacy',
    issue: 'Zombie VMs',
    evidence: '0 network I/O in 90 days',
    monthlySavings: 14250,
    annualSavings: 171000,
    risk: 'Low',
    owner: 'Unassigned',
    region: 'US-East',
    action: 'Retire 15 VMs',
    status: 'Owner Missing',
    confidence: 98,
    requiresChange: true,
    productionImpact: 'None'
  },
  {
    id: 'OPP-02',
    platform: 'Azure',
    resource: 'PROD-DB-Cluster',
    issue: 'Overprovisioned vCPU',
    evidence: 'Max CPU 12% last 45d',
    monthlySavings: 8400,
    annualSavings: 100800,
    risk: 'High',
    owner: 'Sarah Jenkins',
    region: 'EU-West',
    action: 'Right-size to D8s_v5',
    status: 'Needs Validation',
    confidence: 85,
    requiresChange: true,
    productionImpact: 'Reboot Required'
  },
  {
    id: 'OPP-03',
    platform: 'NetApp',
    resource: 'Vol_Archive_2022',
    issue: 'Inactive Data on Flash',
    evidence: '0 reads in 180 days',
    monthlySavings: 4200,
    annualSavings: 50400,
    risk: 'Low',
    owner: 'Storage Admin',
    region: 'Global',
    action: 'Re-tier to Capacity',
    status: 'Quick Win',
    confidence: 100,
    requiresChange: false,
    productionImpact: 'None'
  },
  {
    id: 'OPP-04',
    platform: 'M365',
    resource: 'E5 Licenses',
    issue: 'Unused Licenses',
    evidence: 'No login in 60 days',
    monthlySavings: 2565,
    annualSavings: 30780,
    risk: 'Low',
    owner: 'IT Ops',
    region: 'Global',
    action: 'Reclaim 45 Licenses',
    status: 'Approved',
    confidence: 100,
    requiresChange: false,
    productionImpact: 'None'
  }
];
