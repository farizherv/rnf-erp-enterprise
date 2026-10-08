export type DrillDownCategory = {
  name: string;
  value: number;
  color: string;
};

export type NetWorthTrendData = {
  name: string;
  monthIndex: number;
  isPredictive: boolean;
  assets: number | null;
  liabilities: number | null;
  netWorth: number | null;
  predAssets: number | null;
  predLiabilities: number | null;
  predNetWorth: number | null;
  targetNetWorth: number;
};

export const generateNetWorthData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const nextMonths = ['Jan (Est)', 'Feb (Est)', 'Mar (Est)'];
  
  const data: NetWorthTrendData[] = [];
  const drillDownData: Record<string, { assets: DrillDownCategory[], liabilities: DrillDownCategory[] }> = {};
  
  let currentAssets = 450000000;
  let currentLiabilities = 280000000;
  
  // 1. Generate Historical Data (Jan - Dec)
  months.forEach((m, i) => {
    // Semi-random deterministic walk
    const assetGrowth = 1.01 + (Math.sin(i) * 0.03); // -2% to +4%
    const liabGrowth = 1.00 + (Math.cos(i) * 0.05); // -5% to +5%
    
    currentAssets *= assetGrowth;
    currentLiabilities *= liabGrowth;
    
    // Anomaly logic for visual interest (e.g., big purchase in August)
    if (m === 'Aug') currentAssets += 120000000;
    if (m === 'Aug') currentLiabilities += 100000000;

    // Debt repayment in Nov
    if (m === 'Nov') currentLiabilities -= 80000000;
    
    const assets = Math.round(currentAssets);
    const liabilities = Math.round(currentLiabilities);
    const netWorth = assets - liabilities;

    data.push({
      name: m,
      monthIndex: i,
      isPredictive: false,
      assets,
      liabilities,
      netWorth,
      predAssets: null,
      predLiabilities: null,
      predNetWorth: null,
      targetNetWorth: 350000000
    });

    // Generate Drill-down data
    drillDownData[m] = {
      assets: [
        { name: 'Current Assets (Cash & Equivalents)', value: assets * 0.35, color: '#10b981' },
        { name: 'Accounts Receivable', value: assets * 0.20, color: '#34d399' },
        { name: 'Inventory', value: assets * 0.15, color: '#6ee7b7' },
        { name: 'Fixed Assets (Property & Equip)', value: assets * 0.30, color: '#047857' },
      ],
      liabilities: [
        { name: 'Accounts Payable', value: liabilities * 0.40, color: '#f43f5e' },
        { name: 'Short-Term Debt', value: liabilities * 0.25, color: '#fb7185' },
        { name: 'Long-Term Debt', value: liabilities * 0.30, color: '#be123c' },
        { name: 'Accrued Expenses', value: liabilities * 0.05, color: '#fda4af' },
      ]
    };
  });

  // Calculate Moving Average for Predictive (last 3 months)
  const last3Assets = data.slice(-3).reduce((acc, d) => acc + (d.assets || 0), 0) / 3;
  const last3Liabilities = data.slice(-3).reduce((acc, d) => acc + (d.liabilities || 0), 0) / 3;

  let predAssetsBase = last3Assets;
  let predLiabBase = last3Liabilities;

  // 2. Generate Predictive Data (Next Jan-Mar)
  nextMonths.forEach((m, i) => {
    predAssetsBase *= 1.025; // Optimistic AI projection 2.5% growth
    predLiabBase *= 0.985;   // AI projection 1.5% debt reduction

    data.push({
      name: m,
      monthIndex: 12 + i,
      isPredictive: true,
      assets: null,
      liabilities: null,
      netWorth: null,
      predAssets: Math.round(predAssetsBase),
      predLiabilities: Math.round(predLiabBase),
      predNetWorth: Math.round(predAssetsBase - predLiabBase),
      targetNetWorth: 350000000
    });
  });

  // Bridge the line visually from Dec to Jan (Est)
  const decData = data[11];
  decData.predAssets = decData.assets;
  decData.predLiabilities = decData.liabilities;
  decData.predNetWorth = decData.netWorth;

  return { trendData: data, drillDownData };
};
