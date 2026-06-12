import Papa from 'papaparse';
import type { OptimizationRecommendation, Platform } from '../types';

export const parseCSVFile = (file: File, platform: Platform): Promise<OptimizationRecommendation[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      complete: (results: any) => {
        try {
          const normalized = normalizeData(results.data as Record<string, any>[], platform, file.name);
          resolve(normalized);
        } catch (err) {
          reject(err);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Helper to find a field using possible variations
const findField = (row: Record<string, any>, variations: string[]): any => {
  const rowKeys = Object.keys(row);
  for (const variation of variations) {
    const key = rowKeys.find(k => k.toLowerCase().replace(/\s/g, '') === variation.toLowerCase().replace(/\s/g, ''));
    if (key && row[key] !== undefined && row[key] !== null) {
      return row[key];
    }
  }
  return null;
};

const normalizeData = (data: Record<string, any>[], platform: Platform, filename: string): OptimizationRecommendation[] => {
  const recommendations: OptimizationRecommendation[] = [];

  data.forEach((row, index) => {
    // Only generate recommendation if deterministic rules flag it as waste
    const r = evaluateDeterministicRules(row, platform, index, filename);
    if (r) {
      recommendations.push(r);
    }
  });

  return recommendations;
};

const evaluateDeterministicRules = (row: Record<string, any>, platform: Platform, index: number, filename: string): OptimizationRecommendation | null => {
  const id = `${platform.toLowerCase().replace(/\s/g, '-')}-${Date.now()}-${index}`;
  
  // Base normalization
  const owner = findField(row, ['owner', 'ownerName', 'applicationOwner', 'appOwner', 'responsable', 'email', 'mail', 'ownerEmail']);
  const tagsStr = findField(row, ['tags']);
  let tags: string[] = [];
  if (tagsStr && typeof tagsStr === 'string') {
    tags = tagsStr.split(',').map(t => t.trim());
  }

  const env = findField(row, ['environment', 'env']);
  const isDevTest = env && (env.toLowerCase().includes('dev') || env.toLowerCase().includes('test'));
  const isProd = env && env.toLowerCase().includes('prod');

  // We set source and data quality globally in the Context, but per-recommendation we flag it:
  const base: Partial<OptimizationRecommendation> = {
    id,
    platform,
    owner: owner || null,
    tags,
    country: findField(row, ['country', 'region', 'pais', 'país']) || 'Global',
    businessUnit: findField(row, ['businessUnit', 'bu', 'department', 'area']) || 'IT',
    isProduction: isProd || false,
    status: 'Needs Validation',
    confidence: 80,
    source: 'CSV',
    sourceFile: filename,
  };

  // ----- PLATFORM SPECIFIC RULES ----- //

  if (platform === 'VMware' || platform === 'Oracle VM') {
    const resourceName = findField(row, ['vmName', 'name', 'VM', 'virtualMachine', 'resourceName']) || `Unknown-VM-${index}`;
    const powerState = findField(row, ['powerState', 'state', 'status']);
    const provisionedGB = Number(findField(row, ['provisionedGB', 'provisionedStorageGB']) || 0);
    const usedGB = Number(findField(row, ['usedGB', 'usedStorageGB']) || provisionedGB);
    const cpuAverage = Number(findField(row, ['cpuAverage', 'avgCpu', 'cpuUsage', 'cpuUsagePercent']) || 100);
    const memoryAverage = Number(findField(row, ['memoryAverage', 'avgMemory', 'memoryUsagePercent']) || 100);
    const oldestSnapshotDays = Number(findField(row, ['oldestSnapshotDays', 'snapshotAge', 'oldestSnapshot']) || 0);

    const isPoweredOff = powerState && powerState.toString().toLowerCase().includes('off');

    if (isPoweredOff && provisionedGB > 50) {
      return {
        ...base, resourceName, resourceType: 'Virtual Machine', issue: 'Powered off but consuming expensive storage.', evidence: `Powered off, ${provisionedGB}GB provisioned.`,
        monthlySavings: provisionedGB * 0.15, annualSavings: provisionedGB * 0.15 * 12, riskLevel: 'Low', actionType: 'Cleanup', recommendedAction: 'Archive and delete VM.', requiresChange: true, productionImpact: 'None', status: 'Quick Win', confidence: 95
      } as OptimizationRecommendation;
    }
    if (cpuAverage < 10 && memoryAverage < 30) {
      return {
        ...base, resourceName, resourceType: 'Virtual Machine', issue: 'Severely underutilized compute.', evidence: `CPU avg ${cpuAverage}%, Mem avg ${memoryAverage}%.`,
        monthlySavings: 85, annualSavings: 1020, riskLevel: isProd ? 'High' : 'Medium', actionType: 'Rightsize', recommendedAction: 'Downsize VM instance.', requiresChange: true, productionImpact: isProd ? 'High' : 'Low', confidence: 85
      } as OptimizationRecommendation;
    }
    if (oldestSnapshotDays > 30) {
      return {
        ...base, resourceName, resourceType: 'Snapshot', issue: 'Stale snapshot consuming Tier 1 storage.', evidence: `Oldest snapshot is ${oldestSnapshotDays} days old.`,
        monthlySavings: 45, annualSavings: 540, riskLevel: 'Low', actionType: 'Cleanup', recommendedAction: 'Consolidate or delete snapshots.', requiresChange: false, productionImpact: 'None', status: 'Quick Win', confidence: 90
      } as OptimizationRecommendation;
    }
    if (provisionedGB / (usedGB || 1) > 3) {
      return {
        ...base, resourceName, resourceType: 'Virtual Machine', issue: 'Heavily overprovisioned storage.', evidence: `${provisionedGB}GB provisioned vs ${usedGB}GB used.`,
        monthlySavings: (provisionedGB - usedGB) * 0.1, annualSavings: (provisionedGB - usedGB) * 0.1 * 12, riskLevel: 'Medium', actionType: 'Rightsize', recommendedAction: 'Reduce VM disk size.', requiresChange: true, productionImpact: 'Low', confidence: 75
      } as OptimizationRecommendation;
    }
    if (isDevTest && !isPoweredOff) {
      return {
        ...base, resourceName, resourceType: 'Virtual Machine', issue: 'Dev/Test VM running continuously.', evidence: `Environment is ${env}, PowerState is On.`,
        monthlySavings: 60, annualSavings: 720, riskLevel: 'Medium', actionType: 'Schedule', recommendedAction: 'Implement auto-shutdown schedule (e.g. 7pm-7am).', requiresChange: true, productionImpact: 'None', confidence: 80
      } as OptimizationRecommendation;
    }
  }

  if (platform === 'Azure') {
    const resourceName = findField(row, ['resourceName', 'name']) || `Unknown-Resource-${index}`;
    const cost = Number(findField(row, ['cost', 'pretaxCost', 'costInBillingCurrency']) || 0);
    const serviceName = findField(row, ['serviceName', 'service', 'meterCategory'])?.toString().toLowerCase() || '';
    
    if (cost > 500 && !owner) {
      return {
        ...base, resourceName, resourceType: serviceName || 'Azure Resource', issue: 'High cost resource missing owner.', evidence: `Monthly cost $${cost}, no owner assigned.`,
        monthlySavings: cost * 0.05, annualSavings: cost * 0.05 * 12, riskLevel: 'Low', actionType: 'Tagging', recommendedAction: 'Identify owner for cost chargeback.', requiresChange: false, productionImpact: 'None', status: 'Owner Missing', confidence: 99
      } as OptimizationRecommendation;
    }
    if (serviceName.includes('disk') && !owner && !env) {
      return {
        ...base, resourceName, resourceType: 'Managed Disk', issue: 'Untagged unattached disk candidate.', evidence: `Disk service, no owner, no env. Cost: $${cost}`,
        monthlySavings: cost || 20, annualSavings: (cost || 20) * 12, riskLevel: 'Low', actionType: 'Review', recommendedAction: 'Verify if disk is attached, otherwise delete.', requiresChange: false, productionImpact: 'Low', confidence: 85
      } as OptimizationRecommendation;
    }
    if (resourceName.toLowerCase().includes('dev') || resourceName.toLowerCase().includes('test')) {
      if (cost > 150) {
        return {
          ...base, resourceName, resourceType: serviceName || 'Compute', issue: 'High cost for Dev/Test environment.', evidence: `Name suggests dev/test, cost is $${cost}.`,
          monthlySavings: cost * 0.3, annualSavings: cost * 0.3 * 12, riskLevel: 'Medium', actionType: 'Schedule', recommendedAction: 'Apply startup/shutdown schedule.', requiresChange: true, productionImpact: 'None', confidence: 80
        } as OptimizationRecommendation;
      }
    }
  }

  if (platform === 'SharePoint') {
    const resourceName = findField(row, ['siteName', 'name', 'title']) || `Unknown-Site-${index}`;
    const lastActivityDays = Number(findField(row, ['lastActivityDays', 'inactiveDays', 'daysSinceLastActivity']) || 0);
    const versionStorageGB = Number(findField(row, ['versionStorageGB', 'versionsGB']) || 0);
    const storageGB = Number(findField(row, ['storageGB', 'storageUsedGB', 'usedGB']) || 0);
    const teamsConnected = findField(row, ['teamsConnected']);
    const externalSharing = findField(row, ['externalSharing']);

    if (lastActivityDays > 90) {
      return {
        ...base, resourceName, resourceType: 'SharePoint Site', issue: 'Inactive site consuming storage.', evidence: `No activity in ${lastActivityDays} days.`,
        monthlySavings: storageGB * 0.2, annualSavings: storageGB * 0.2 * 12, riskLevel: 'Low', actionType: 'Archive', recommendedAction: 'Archive site or change to read-only.', requiresChange: true, productionImpact: 'None', confidence: 90
      } as OptimizationRecommendation;
    }
    if (versionStorageGB > 20) {
      return {
        ...base, resourceName, resourceType: 'SharePoint Site', issue: 'Excessive version history bloat.', evidence: `${versionStorageGB}GB consumed purely by file versions.`,
        monthlySavings: versionStorageGB * 0.2, annualSavings: versionStorageGB * 0.2 * 12, riskLevel: 'Low', actionType: 'Cleanup', recommendedAction: 'Trim version history limits.', requiresChange: false, productionImpact: 'None', status: 'Quick Win', confidence: 95
      } as OptimizationRecommendation;
    }
    if (teamsConnected && lastActivityDays > 120) {
      return {
        ...base, resourceName, resourceType: 'Teams Connected Site', issue: 'Abandoned Microsoft Teams workspace.', evidence: `Teams connected, inactive for ${lastActivityDays} days.`,
        monthlySavings: 15, annualSavings: 180, riskLevel: 'Low', actionType: 'Archive', recommendedAction: 'Archive Microsoft Team.', requiresChange: true, productionImpact: 'None', confidence: 85
      } as OptimizationRecommendation;
    }
    if (externalSharing && lastActivityDays > 90) {
      return {
        ...base, resourceName, resourceType: 'SharePoint Site', issue: 'Stale external sharing links.', evidence: `External sharing enabled, inactive ${lastActivityDays} days.`,
        monthlySavings: 0, annualSavings: 0, riskLevel: 'High', actionType: 'Review', recommendedAction: 'Revoke external access for security.', requiresChange: true, productionImpact: 'None', confidence: 99
      } as OptimizationRecommendation;
    }
  }

  if (platform === 'Rubrik') {
    const resourceName = findField(row, ['objectName', 'name', 'workload']) || `Unknown-Object-${index}`;
    const retentionDays = Number(findField(row, ['retentionDays', 'retention']) || 0);
    const isProtected = findField(row, ['protected', 'isProtected']);
    const isRetired = findField(row, ['isRetired', 'retired']);
    const storageTB = Number(findField(row, ['storageTB', 'storageGB', 'protectedStorage']) || 0);
    
    // Normalize storage to GB if TB is provided
    const storageCostGB = storageTB < 1000 ? storageTB * 1000 : storageTB; // simplistic heuristic

    if (retentionDays > 90 && isDevTest) {
      return {
        ...base, resourceName, resourceType: 'Backup Workload', issue: 'Excessive retention for Dev/Test.', evidence: `Retention is ${retentionDays} days for ${env} environment.`,
        monthlySavings: storageCostGB * 0.05, annualSavings: storageCostGB * 0.05 * 12, riskLevel: 'Medium', actionType: 'Retention', recommendedAction: 'Reduce SLA domain retention to 14 days.', requiresChange: true, productionImpact: 'None', confidence: 85
      } as OptimizationRecommendation;
    }
    if (isRetired && isProtected) {
      return {
        ...base, resourceName, resourceType: 'Backup Workload', issue: 'Backing up retired workload.', evidence: `Object is retired but still actively protected.`,
        monthlySavings: storageCostGB * 0.08, annualSavings: storageCostGB * 0.08 * 12, riskLevel: 'Low', actionType: 'Cleanup', recommendedAction: 'Unprotect object and let retention expire.', requiresChange: true, productionImpact: 'None', status: 'Quick Win', confidence: 95
      } as OptimizationRecommendation;
    }
  }

  if (platform === 'NetApp') {
    const resourceName = findField(row, ['volumeName', 'name', 'volume']) || `Unknown-Volume-${index}`;
    const lastAccessDays = Number(findField(row, ['lastAccessDays', 'inactiveDays']) || 0);
    const provisionedTB = Number(findField(row, ['provisionedTB', 'provisionedGB', 'size']) || 0);
    const usedTB = Number(findField(row, ['usedTB', 'usedGB', 'used']) || 0);
    const snapshotTB = Number(findField(row, ['snapshotTB', 'snapshotGB']) || 0);

    // Convert assumed TB to GB for savings calculation ($0.10/GB roughly)
    const provGB = provisionedTB < 100 ? provisionedTB * 1024 : provisionedTB;
    const usedGB = usedTB < 100 ? usedTB * 1024 : usedTB;
    const snapGB = snapshotTB < 100 ? snapshotTB * 1024 : snapshotTB;

    if (lastAccessDays > 90) {
      return {
        ...base, resourceName, resourceType: 'NetApp Volume', issue: 'Cold data on Tier 1 NetApp.', evidence: `No access in ${lastAccessDays} days.`,
        monthlySavings: usedGB * 0.05, annualSavings: usedGB * 0.05 * 12, riskLevel: 'Medium', actionType: 'Archive', recommendedAction: 'Tier to FabricPool/S3.', requiresChange: true, productionImpact: 'Low', confidence: 90
      } as OptimizationRecommendation;
    }
    if (provGB / (usedGB || 1) > 3) {
      return {
        ...base, resourceName, resourceType: 'NetApp Volume', issue: 'Overprovisioned volume.', evidence: `${provGB}GB provisioned, ${usedGB}GB used.`,
        monthlySavings: (provGB - usedGB) * 0.08, annualSavings: (provGB - usedGB) * 0.08 * 12, riskLevel: 'High', actionType: 'Rightsize', recommendedAction: 'Shrink volume size.', requiresChange: true, productionImpact: 'Medium', confidence: 80
      } as OptimizationRecommendation;
    }
    if (snapGB > usedGB * 0.2) {
      return {
        ...base, resourceName, resourceType: 'NetApp Snapshot', issue: 'Excessive snapshot consumption.', evidence: `Snapshots consume ${snapGB}GB (>20% of used capacity).`,
        monthlySavings: snapGB * 0.08, annualSavings: snapGB * 0.08 * 12, riskLevel: 'Low', actionType: 'Cleanup', recommendedAction: 'Review snapshot policies and delete old snaps.', requiresChange: false, productionImpact: 'None', status: 'Quick Win', confidence: 85
      } as OptimizationRecommendation;
    }
  }

  if (platform === 'Pure Storage') {
    const resourceName = findField(row, ['volumeName', 'name', 'volume']) || `Unknown-Volume-${index}`;
    const iopsAverage = Number(findField(row, ['iopsAverage', 'avgIops', 'iops']) || 100);
    const lastActivityDays = Number(findField(row, ['lastActivityDays', 'inactiveDays']) || 0);
    const connectedHost = findField(row, ['connectedHost', 'host']);

    const provisionedTB = Number(findField(row, ['provisionedTB', 'provisionedGB', 'size']) || 0);
    const provGB = provisionedTB < 100 ? provisionedTB * 1024 : provisionedTB;

    if (iopsAverage < 5 && lastActivityDays > 60) {
      return {
        ...base, resourceName, resourceType: 'Pure Volume', issue: 'Zombie volume on FlashArray.', evidence: `IOPS < 5, inactive for ${lastActivityDays} days.`,
        monthlySavings: provGB * 0.15, annualSavings: provGB * 0.15 * 12, riskLevel: 'High', actionType: 'Cleanup', recommendedAction: 'Verify and delete volume.', requiresChange: true, productionImpact: 'High', confidence: 85
      } as OptimizationRecommendation;
    }
    if (!connectedHost) {
      return {
        ...base, resourceName, resourceType: 'Pure Volume', issue: 'Disconnected/Orphaned volume.', evidence: `No connected host mapping.`,
        monthlySavings: provGB * 0.15, annualSavings: provGB * 0.15 * 12, riskLevel: 'Low', actionType: 'Cleanup', recommendedAction: 'Delete orphaned volume.', requiresChange: true, productionImpact: 'None', status: 'Quick Win', confidence: 95
      } as OptimizationRecommendation;
    }
  }

  return null; // No waste detected
};
