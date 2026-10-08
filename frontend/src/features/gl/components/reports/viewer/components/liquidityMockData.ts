export type DrillDownLiquidityCategory = {
  name: string;
  value: number;
  color: string;
};

export type LiquidityTrendData = {
  name: string;
  monthIndex: number;
  isPredictive: boolean;
  
  // Base numbers
  currentAssets: number | null;
  currentLiabilities: number | null;
  inventory: number | null; // Needed for Quick Ratio
  cashAndEquivalents: number | null; // Needed for Cash Ratio
  
  // Predictive base numbers
  predCurrentAssets: number | null;
  predCurrentLiabilities: number | null;
  predInventory: number | null;
  predCashAndEquivalents: number | null;
  
  // Computed ratios (for historical)
  currentRatio: number | null;
  quickRatio: number | null;
  cashRatio: number | null;
  workingCapital: number | null;
  
  // Computed ratios (for predictive)
  predCurrentRatio: number | null;
  predQuickRatio: number | null;
  predCashRatio: number | null;
  predWorkingCapital: number | null;
};

export const generateLiquidityData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const nextMonths = ['Jan (Est)', 'Feb (Est)', 'Mar (Est)'];
  
  const data: LiquidityTrendData[] = [];
  const drillDownData: Record<string, { currentAssets: DrillDownLiquidityCategory[], currentLiabilities: DrillDownLiquidityCategory[] }> = {};
  
  let currentAssets = 320000000;
  let currentLiabilities = 240000000;
  let inventory = 85000000;
  let cash = 120000000;
  
  // 1. Generate Historical Data (Jan - Dec)
  months.forEach((m, i) => {
    // Semi-random deterministic walk
    const caGrowth = 1.01 + (Math.sin(i) * 0.04);
    const clGrowth = 1.00 + (Math.cos(i) * 0.03);
    
    currentAssets *= caGrowth;
    currentLiabilities *= clGrowth;
    inventory = currentAssets * 0.28; // Inventory is roughly 28% of CA
    cash = currentAssets * 0.35; // Cash is roughly 35% of CA
    
    // Anomaly logic for visual interest (e.g., big cash influx in Sept)
    if (m === 'Sep') {
        currentAssets += 50000000;
        cash += 50000000;
        currentLiabilities -= 20000000;
    }
    
    // Compute Ratios
    const currentRatio = currentAssets / currentLiabilities;
    const quickRatio = (currentAssets - inventory) / currentLiabilities;
    const cashRatio = cash / currentLiabilities;
    const workingCapital = currentAssets - currentLiabilities;
    
    data.push({
      name: m,
      monthIndex: i,
      isPredictive: false,
      currentAssets,
      currentLiabilities,
      inventory,
      cashAndEquivalents: cash,
      predCurrentAssets: null,
      predCurrentLiabilities: null,
      predInventory: null,
      predCashAndEquivalents: null,
      currentRatio,
      quickRatio,
      cashRatio,
      workingCapital,
      predCurrentRatio: null,
      predQuickRatio: null,
      predCashRatio: null,
      predWorkingCapital: null,
    });
    
    // Generate Drill-down data for this month
    drillDownData[m] = {
      currentAssets: [
        { name: 'Cash & Equivalents', value: cash, color: '#10b981' },
        { name: 'Accounts Receivable', value: currentAssets * 0.3, color: '#3b82f6' },
        { name: 'Inventory', value: inventory, color: '#f59e0b' },
        { name: 'Prepaid Expenses', value: currentAssets * 0.07, color: '#8b5cf6' },
      ],
      currentLiabilities: [
        { name: 'Accounts Payable', value: currentLiabilities * 0.45, color: '#f43f5e' },
        { name: 'Short-term Debt', value: currentLiabilities * 0.3, color: '#f97316' },
        { name: 'Accrued Expenses', value: currentLiabilities * 0.25, color: '#ec4899' },
      ]
    };
  });
  
  // 2. Generate AI Predictive Forecast Data
  const lastActual = data[data.length - 1];
  
  // Bridge the line visually from Dec to Jan (Est)
  lastActual.predCurrentAssets = lastActual.currentAssets;
  lastActual.predCurrentLiabilities = lastActual.currentLiabilities;
  lastActual.predInventory = lastActual.inventory;
  lastActual.predCashAndEquivalents = lastActual.cashAndEquivalents;
  lastActual.predCurrentRatio = lastActual.currentRatio;
  lastActual.predQuickRatio = lastActual.quickRatio;
  lastActual.predCashRatio = lastActual.cashRatio;
  lastActual.predWorkingCapital = lastActual.workingCapital;
  
  let predCA = lastActual.currentAssets!;
  let predCL = lastActual.currentLiabilities!;
  
  nextMonths.forEach((m, i) => {
    predCA *= 1.02;
    predCL *= 0.98;
    
    const pInv = predCA * 0.27;
    const pCash = predCA * 0.38; 
    
    const pCR = predCA / predCL;
    const pQR = (predCA - pInv) / predCL;
    const pCashR = pCash / predCL;
    const pWC = predCA - predCL;
    
    data.push({
      name: m,
      monthIndex: 12 + i,
      isPredictive: true,
      currentAssets: null,
      currentLiabilities: null,
      inventory: null,
      cashAndEquivalents: null,
      predCurrentAssets: predCA,
      predCurrentLiabilities: predCL,
      predInventory: pInv,
      predCashAndEquivalents: pCash,
      currentRatio: null,
      quickRatio: null,
      cashRatio: null,
      workingCapital: null,
      predCurrentRatio: pCR,
      predQuickRatio: pQR,
      predCashRatio: pCashR,
      predWorkingCapital: pWC,
    });
  });
  
  return { trendData: data, drillDownData };
};
