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
          const normalized = normalizeData(results.data as Record<string, any>[], platform);
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

const normalizeData = (data: Record<string, any>[], platform: Platform): OptimizationRecommendation[] => {
  const recommendations: OptimizationRecommendation[] = [];

  data.forEach((row, index) => {
    const r = generateRecommendation(row, platform, index);
    if (r) {
      recommendations.push(r);
    }
  });

  return recommendations;
};

const generateRecommendation = (row: Record<string, any>, platform: Platform, index: number): OptimizationRecommendation | null => {
  const id = `${platform.toLowerCase().replace(/\s/g, '-')}-${Date.now()}-${index}`;
  
  const resourceName = row.name || row.resourceName || row.vmName || row.volumeName || row.objectName || row.siteName || `Unknown-${index}`;
  const owner = row.owner || row.ownerEmail || null;
  let tags: string[] = [];
  
  if (row.tags) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tags = typeof row.tags === 'string' ? (row.tags as string).split(',').map(t => t.trim()) : [];
    } catch {
      tags = [];
    }
  }

  // Base recommendation template
  const base: Partial<OptimizationRecommendation> = {
    id,
    platform,
    resourceName,
    owner,
    tags,
    country: row.country || 'Global',
    businessUnit: row.businessUnit || 'IT',
    isProduction: row.environment?.toLowerCase().includes('prod') || false,
    status: 'Needs Validation',
    confidence: 80,
  };

  // Waste Intelligence Rules based on Platform
  if (platform === 'Azure') {
    const cost = Number(row.cost || 0);
    const cpu = Number(row.cpuAverage || 100);
    const powerState = row.powerState?.toLowerCase();

    if (powerState === 'deallocated' || powerState === 'stopped') {
      return {
        ...base,
        resourceType: row.type || 'Virtual Machine',
        issue: 'Resource is deallocated but still incurring storage/IP costs.',
        evidence: 'PowerState is Stopped/Deallocated.',
        monthlySavings: cost || 150,
        annualSavings: (cost || 150) * 12,
        riskLevel: 'Low',
        actionType: 'Cleanup',
        recommendedAction: 'Delete resource or snapshot.',
        requiresChange: false,
        productionImpact: 'None',
        status: 'Quick Win',
        confidence: 95,
      } as OptimizationRecommendation;
    }

    if (cpu < 5) {
      return {
        ...base,
        resourceType: row.type || 'Virtual Machine',
        issue: 'Severely underutilized compute.',
        evidence: `CPU average is ${cpu}%.`,
        monthlySavings: (cost || 200) * 0.5, // Estimate 50% savings
        annualSavings: ((cost || 200) * 0.5) * 12,
        riskLevel: base.isProduction ? 'High' : 'Medium',
        actionType: 'Rightsize',
        recommendedAction: 'Downsize instance type.',
        requiresChange: true,
        productionImpact: base.isProduction ? 'High' : 'Low',
        confidence: 85,
      } as OptimizationRecommendation;
    }
  }

  if (platform === 'VMware' || platform === 'Oracle VM') {
    const provisioned = Number(row.provisionedGB || 0);
    const used = Number(row.usedGB || provisioned);
    const cpu = Number(row.cpuAverage || 100);
    const snapshots = Number(row.snapshotCount || 0);
    const oldestSnapshot = Number(row.oldestSnapshotDays || 0);

    if (snapshots > 3 && oldestSnapshot > 30) {
      return {
        ...base,
        resourceType: 'Virtual Machine',
        issue: 'Stale snapshots consuming expensive tier 1 storage.',
        evidence: `${snapshots} snapshots, oldest is ${oldestSnapshot} days old.`,
        monthlySavings: snapshots * 15, // Estimate $15 per stale snapshot
        annualSavings: (snapshots * 15) * 12,
        riskLevel: 'Low',
        actionType: 'Cleanup',
        recommendedAction: 'Consolidate and delete old snapshots.',
        requiresChange: false,
        productionImpact: 'None',
        status: 'Quick Win',
        confidence: 90,
      } as OptimizationRecommendation;
    }

    if (cpu < 10 && provisioned > used * 2) {
      return {
        ...base,
        resourceType: 'Virtual Machine',
        issue: 'Oversized VM (CPU and Storage).',
        evidence: `CPU ${cpu}%, Storage utilization < 50%.`,
        monthlySavings: 120, 
        annualSavings: 1440,
        riskLevel: 'Medium',
        actionType: 'Rightsize',
        recommendedAction: 'Reduce vCPU and reclaim datastore space.',
        requiresChange: true,
        productionImpact: 'Medium',
        confidence: 75,
      } as OptimizationRecommendation;
    }
  }

  if (platform === 'NetApp' || platform === 'Pure Storage') {
    const lastAccess = Number(row.lastAccessDays || row.lastActivityDays || 0);
    
    if (lastAccess > 90) {
      return {
        ...base,
        resourceType: 'Volume',
        issue: 'Cold data on high-performance NVMe/Flash tier.',
        evidence: `No access in ${lastAccess} days.`,
        monthlySavings: 300,
        annualSavings: 3600,
        riskLevel: 'Medium',
        actionType: 'Archive',
        recommendedAction: 'Re-tier to object storage (S3/Blob).',
        requiresChange: true,
        productionImpact: 'Low',
        confidence: 80,
      } as OptimizationRecommendation;
    }
  }

  // Generic fallback for any row if no specific rules match
  // We don't want to show EVERY row as waste, only if some heuristic is met,
  // but for the sake of demo/CSV parsing, we'll create a low confidence recommendation 
  // if 'cost' or 'provisionedGB' is unusually high.
  const genericCost = Number(row.cost || 0);
  if (genericCost > 1000) {
    return {
      ...base,
      resourceType: row.type || 'Resource',
      issue: 'High cost anomaly detected.',
      evidence: `Spend is $${genericCost}, exceeding standard baseline.`,
      monthlySavings: genericCost * 0.1, // Recommend 10% savings
      annualSavings: (genericCost * 0.1) * 12,
      riskLevel: 'High',
      actionType: 'Review',
      recommendedAction: 'Conduct architectural review.',
      requiresChange: true,
      productionImpact: 'High',
      confidence: 50,
      tags: [...tags, 'Data Quality Caveat'],
    } as OptimizationRecommendation;
  }

  return null; // No waste detected
};
