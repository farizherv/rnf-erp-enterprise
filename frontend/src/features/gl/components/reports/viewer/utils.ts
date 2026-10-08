import type { BalanceSheetNode, FlatNode } from './types';

// Formatting helper
export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(val);
};

export const getInitialExpandedNodes = (nodes: BalanceSheetNode[]): Set<string> => {
  const set = new Set<string>();
  const traverse = (n: BalanceSheetNode) => {
    if (n.children && n.children.length > 0) {
      set.add(n.id);
      n.children.forEach(traverse);
    }
  };
  nodes.forEach(traverse);
  return set;
};

export const getVisibleRows = (nodes: BalanceSheetNode[], expandedSet: Set<string>, level = 0): FlatNode[] => {
  let rows: FlatNode[] = [];
  for (const node of nodes) {
    rows.push({ node, level });
    if (expandedSet.has(node.id) && node.children && node.children.length > 0) {
      rows = rows.concat(getVisibleRows(node.children, expandedSet, level + 1));
    }
  }
  return rows;
};

export const yAxisFormatter = (val: number) => {
  const absVal = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (absVal >= 1000000000000) return `${sign}Rp ${(absVal / 1000000000000).toFixed(1).replace('.', ',')} T`;
  if (absVal >= 1000000000) return `${sign}Rp ${(absVal / 1000000000).toFixed(1).replace('.', ',')} M`;
  if (absVal >= 1000000) return `${sign}Rp ${(absVal / 1000000).toFixed(1).replace('.', ',')} Jt`;
  if (absVal >= 1000) return `${sign}Rp ${(absVal / 1000).toFixed(0)} Rb`;
  return `${sign}Rp ${absVal.toString()}`;
};

export const extractAccountValue = (nodes: BalanceSheetNode[], keywords: string[]): number => {
  let total = 0;
  const search = (nodeList: BalanceSheetNode[]) => {
    for (const node of nodeList) {
      if (keywords.some(k => node.description.toLowerCase().includes(k))) {
        total += (node.balance || 0);
        continue; // Prevent double counting children if parent matches
      }
      if (node.children) search(node.children);
    }
  };
  search(nodes);
  return total;
};
