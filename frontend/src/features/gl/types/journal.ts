/**
 * Enterprise Grade Journal Voucher DTOs (Data Transfer Objects)
 * 
 * Struktur ini menggunakan snake_case untuk berinteraksi langsung
 * dengan Backend Database SQL (SQLite/PostgreSQL) dalam arsitektur Offline Desktop.
 */

export interface JournalLinePayload {
  account_id: string;
  department_id: string | null;
  project_id: string | null;
  description: string;
  debit: number;
  credit: number;
}

export interface JournalVoucherPayload {
  company_id: string;
  voucher_no: string;
  transaction_date: string;
  description: string;
  reference_no: string | null;
  currency_code: string;
  exchange_rate: number;
  status: 'DRAFT' | 'POSTED' | 'VOID';
  total_debit: number;
  total_credit: number;
  lines: JournalLinePayload[];
}
