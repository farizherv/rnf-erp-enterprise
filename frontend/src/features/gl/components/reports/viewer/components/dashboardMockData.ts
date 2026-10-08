export type TrendData = {
  name: string;
  monthIndex: number;
  isPredictive: boolean;
  actualIncome: number | null;
  actualExpense: number | null;
  predIncome: number | null;
  predExpense: number | null;
  budgetLimit: number;
  netProfit: number | null;
};

export type DrillDownCategory = {
  name: string;
  value: number;
  color: string;
};

// --- Mock Data Generator Engine ---
export const generateAdvancedData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const nextMonths = ['Jan (Est)', 'Feb (Est)', 'Mar (Est)'];
  
  const data: TrendData[] = [];
  const drillDownData: Record<string, { income: DrillDownCategory[], expense: DrillDownCategory[] }> = {};
  
  let baseIncome = 150000000;
  let baseExpense = 90000000;
  const budgetLimit = 130000000;

  // Generate Actual Data (Jan-Dec)
  months.forEach((m, i) => {
    // Add some random variance to simulate real business
    const varIncome = baseIncome + (Math.random() * 40000000 - 10000000);
    // Simulate expense spikes in mid-year and end-year
    const expSpike = (i === 5 || i === 11) ? 50000000 : 0; 
    const varExpense = baseExpense + (Math.random() * 30000000 - 15000000) + expSpike;
    
    data.push({
      name: m,
      monthIndex: i,
      isPredictive: false,
      actualIncome: varIncome,
      actualExpense: varExpense,
      predIncome: null,
      predExpense: null,
      budgetLimit: budgetLimit,
      netProfit: varIncome - varExpense,
    });

    // Generate Drill-down for this month
    // Add some pseudo-randomness based on month index so percentages vary
    const p1 = 0.65 + (Math.sin(i) * 0.10); // varies between 0.55 and 0.75
    const p2 = 0.25 - (Math.sin(i) * 0.05); // varies between 0.20 and 0.30
    const p3 = 1.0 - p1 - p2; // remainder

    const e1 = 0.40 + (Math.cos(i) * 0.08); 
    const e2 = 0.35 - (Math.cos(i) * 0.05);
    const e3 = 0.15;
    const e4 = 1.0 - e1 - e2 - e3;

    drillDownData[m] = {
      income: [
        { name: 'Penjualan Produk', value: varIncome * p1, color: '#10b981' }, // emerald-500
        { name: 'Jasa & Servis', value: varIncome * p2, color: '#34d399' }, // emerald-400
        { name: 'Pendapatan Lain', value: varIncome * p3, color: '#6ee7b7' }, // emerald-300
      ],
      expense: [
        { name: 'Gaji Karyawan', value: varExpense * e1, color: '#f43f5e' }, // rose-500
        { name: 'Operasional', value: varExpense * e2, color: '#fb7185' }, // rose-400
        { name: 'Pajak & Bunga', value: varExpense * e3, color: '#fda4af' }, // rose-300
        { name: 'Lain-lain', value: varExpense * e4, color: '#fecdd3' }, // rose-200
      ]
    };

    // Slight upward trend over the year
    baseIncome += 2000000;
    baseExpense += 1500000;
  });

  // Calculate Moving Average for Predictive (last 3 months)
  const last3Income = data.slice(-3).reduce((acc, d) => acc + (d.actualIncome || 0), 0) / 3;
  const last3Expense = data.slice(-3).reduce((acc, d) => acc + (d.actualExpense || 0), 0) / 3;

  // Generate Predictive Data (Next Jan-Mar)
  let predIncBase = last3Income;
  let predExpBase = last3Expense;

  nextMonths.forEach((m, i) => {
    // Add conservative growth factor to predictions
    predIncBase *= 1.02; 
    predExpBase *= 1.01;

    data.push({
      name: m,
      monthIndex: 12 + i,
      isPredictive: true,
      actualIncome: null,
      actualExpense: null,
      predIncome: predIncBase,
      predExpense: predExpBase,
      budgetLimit: budgetLimit,
      netProfit: predIncBase - predExpBase,
    });
  });

  // Also bridge the line visually from Dec to Jan (Est)
  const decData = data[11];
  decData.predIncome = decData.actualIncome;
  decData.predExpense = decData.actualExpense;

  return { trendData: data, drillDownData };
};
