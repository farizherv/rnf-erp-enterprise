const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/features/gl/components/reports/EnterpriseReportViewer.tsx');
const lines = fs.readFileSync(filePath, 'utf-8').split('\n');

// Find ReportRowItemFlatProps interface (should be around 1453)
const startRowItem = lines.findIndex(l => l.includes('interface ReportRowItemFlatProps'));
// Find EnterpriseReportViewer export (around 1650)
const endRowItem = lines.findIndex(l => l.includes('export const EnterpriseReportViewer'));

const rowItemLines = lines.slice(startRowItem, endRowItem);

const rowItemImports = `import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { FlatNode, ReportRowItemFlatProps } from '../types';
import { formatCurrency } from '../utils';\n\n`;

const outRowPath = path.join(__dirname, 'src/features/gl/components/reports/viewer/components/ReportRowItemFlat.tsx');
fs.writeFileSync(outRowPath, rowItemImports + rowItemLines.join('\n').replace('const ReportRowItemFlat: React.FC', 'export const ReportRowItemFlat: React.FC'));

// Now extract EnterpriseFinancialChart and Tooltip (lines 698 to 1450 roughly)
const startTooltip = lines.findIndex(l => l.includes('const EnterpriseCustomTooltip'));
const startChart = lines.findIndex(l => l.includes('const EnterpriseFinancialChart: React.FC'));
// Find the end of Chart (before ReportRowItemFlatProps)
const endChart = startRowItem;

const chartLines = lines.slice(startTooltip, endChart);
const chartImports = `import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart, Cell,
  PieChart as RechartsPieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush, ReferenceLine
} from 'recharts';
import { yAxisFormatter } from '../utils';\n\n`;

const outChartPath = path.join(__dirname, 'src/features/gl/components/reports/viewer/components/EnterpriseFinancialChart.tsx');
// Make sure to export EnterpriseFinancialChart and EnterpriseCustomTooltip
let chartCode = chartLines.join('\n');
chartCode = chartCode.replace('const EnterpriseCustomTooltip', 'export const EnterpriseCustomTooltip');
chartCode = chartCode.replace('const EnterpriseFinancialChart: React.FC', 'export const EnterpriseFinancialChart: React.FC');
fs.writeFileSync(outChartPath, chartImports + chartCode);

console.log('Components extracted.');
