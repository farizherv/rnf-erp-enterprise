export interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
  isHeader: boolean;
  parentId?: string;
  isExpanded?: boolean;
  suspended?: boolean;
  depth?: number;
}
