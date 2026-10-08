export interface DrillDownCategory {
  name: string;
  value: number;
  color: string;
}

export interface RoaRoeData {
  name: string;
  monthIndex: number;
  // Core financial metrics (in billions IDR for scale)
  netIncome: number;
  totalAssets: number;
  totalEquity: number;
  
  // Calculated Ratios (%)
  roa: number;
  roe: number;
  
  // Benchmarks & Targets (%)
  roaTarget: number;
  roeTarget: number;
  
  // Analytical Flags
  isPredictive: boolean;
  insightLabel?: string;
}

// Generate realistic enterprise-grade data
export const generateRoaRoeData = (): { 
  trendData: RoaRoeData[], 
  currentMetrics: any, 
  aiInsights: any,
  drillDownData: Record<string, { income: DrillDownCategory[], assets: DrillDownCategory[], equity: DrillDownCategory[] }>
} => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan (Est)', 'Feb (Est)', 'Mar (Est)'];
  
  const drillDownData: Record<string, { income: DrillDownCategory[], assets: DrillDownCategory[], equity: DrillDownCategory[] }> = {};
  
  let baseAssets = 12500; // 12.5 Trillion IDR
  let baseEquity = 4800; // 4.8 Trillion IDR
  let baseIncome = 450; // 450 Billion IDR Monthly Net Income

  const data: RoaRoeData[] = months.map((month, index) => {
    const isPredictive = index >= 12;
    
    // Simulate natural business cycles and market volatility
    const assetGrowth = 1 + (Math.random() * 0.03 - 0.01); // -1% to +3% asset growth
    const equityGrowth = 1 + (Math.random() * 0.02 - 0.005); // -0.5% to +2% equity growth (retained earnings)
    const incomeVolatility = 1 + (Math.random() * 0.15 - 0.05); // -5% to +15% income volatility

    // specific business events
    if (month === 'Mar') baseAssets *= 1.08; // Major asset acquisition
    if (month === 'Aug') baseIncome *= 1.35; // Peak season profitability
    if (month === 'Nov') baseIncome *= 0.70; // Unexpected operational hit
    
    baseAssets *= assetGrowth;
    baseEquity *= equityGrowth;
    baseIncome *= incomeVolatility;

    // Annualized calculation proxy for monthly charting purposes:
    // (Monthly Income * 12) / Total Assets * 100
    const annualizedRoa = ((baseIncome * 12) / baseAssets) * 100;
    const annualizedRoe = ((baseIncome * 12) / baseEquity) * 100;

    let insight = '';
    if (month === 'Mar') insight = "Asset Acquisition";
    if (month === 'Aug') insight = "Peak Season";
    if (month === 'Nov') insight = "Cost Overrun";
    if (isPredictive) insight = "AI Forecast";

    const netIncomeVal = Math.round(baseIncome);
    const totalAssetsVal = Math.round(baseAssets);
    const totalEquityVal = Math.round(baseEquity);

    // Generate Drill-down data
    drillDownData[month] = {
      income: [
        { name: 'Core Operations', value: netIncomeVal * 0.70, color: '#10b981' }, // Emerald-500
        { name: 'Financial & Interest', value: netIncomeVal * 0.15, color: '#34d399' }, // Emerald-400
        { name: 'Non-Operating Gains', value: netIncomeVal * 0.15, color: '#6ee7b7' }, // Emerald-300
      ],
      assets: [
        { name: 'Current Assets', value: totalAssetsVal * 0.35, color: '#f97316' }, // Orange-500
        { name: 'Fixed Assets', value: totalAssetsVal * 0.40, color: '#fb923c' }, // Orange-400
        { name: 'Intangibles', value: totalAssetsVal * 0.15, color: '#fdba74' }, // Orange-300
        { name: 'Other Assets', value: totalAssetsVal * 0.10, color: '#fed7aa' }, // Orange-200
      ],
      equity: [
        { name: 'Retained Earnings', value: totalEquityVal * 0.55, color: '#f97316' }, // Orange-500
        { name: 'Paid-in Capital', value: totalEquityVal * 0.35, color: '#fb923c' }, // Orange-400
        { name: 'Other Reserves', value: totalEquityVal * 0.10, color: '#fdba74' }, // Orange-300
      ]
    };

    return {
      name: month,
      monthIndex: index,
      netIncome: netIncomeVal,
      totalAssets: totalAssetsVal,
      totalEquity: totalEquityVal,
      roa: Number(annualizedRoa.toFixed(2)),
      roe: Number(annualizedRoe.toFixed(2)),
      roaTarget: 45.0, // Adjusted to match generated data range
      roeTarget: 110.0, // Adjusted to match generated data range
      isPredictive,
      insightLabel: insight || undefined
    };
  });

  // Calculate top-level KPIs based on the latest ACTUAL month (Dec - index 11)
  const currentActual = data[11];
  const previousActual = data[10];

  const currentMetrics = {
    currentRoa: currentActual.roa,
    roaGrowth: currentActual.roa - previousActual.roa,
    
    currentRoe: currentActual.roe,
    roeGrowth: currentActual.roe - previousActual.roe,

    avgAssetTurnover: (currentActual.totalAssets / previousActual.totalAssets).toFixed(2),
    
    industryRoa: currentActual.roaTarget,
    industryRoe: currentActual.roeTarget
  };

  const aiInsights = {
    peakRoaMonth: [...data].slice(0, 12).sort((a, b) => b.roa - a.roa)[0],
    lowestRoaMonth: [...data].slice(0, 12).sort((a, b) => a.roa - b.roa)[0],
    efficiencyStatus: currentMetrics.currentRoa >= currentMetrics.industryRoa ? 'Optimal' : 'Needs Optimization',
    predictiveTrend: data[14].roa > currentActual.roa ? 'Bullish Expansion' : 'Conservative Stabilization'
  };

  return { trendData: data, currentMetrics, aiInsights, drillDownData };
};
