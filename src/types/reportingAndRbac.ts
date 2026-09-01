import { UserRoleName } from './pms';

export type DepartmentName =
  | 'Front Office'
  | 'Housekeeping'
  | 'Food & Beverage'
  | 'Restaurant'
  | 'Bar & Lounge'
  | 'Banquet & Convention'
  | 'Recreation & Activities'
  | 'Amenities & Spa'
  | 'Procurement & Stores'
  | 'Inventory'
  | 'Kitchen / Culinary'
  | 'Finance & Accounts'
  | 'Sales & Marketing'
  | 'Human Resources'
  | 'Engineering & Maintenance'
  | 'Executive Management'
  | 'Internal Audit';

export type MainModuleName =
  | 'dashboard'
  | 'front-office'
  | 'housekeeping'
  | 'restaurant'
  | 'bar'
  | 'banquet'
  | 'activities'
  | 'amenities'
  | 'procurement'
  | 'inventory'
  | 'menu-management'
  | 'finance'
  | 'sales-marketing'
  | 'crm'
  | 'hr'
  | 'reports'
  | 'administration';

export type DataScopeType =
  | 'Own Records'
  | 'Own Outlet'
  | 'Own Department'
  | 'Own Property'
  | 'All Properties';

export interface RoleDefinition {
  id: string;
  name: string;
  department: DepartmentName;
  description: string;
  isSystem: boolean;
  defaultDataScope: DataScopeType;
  allowedModules: MainModuleName[];
  permissions: string[];
}

export type ReportCategory =
  | 'Front Office'
  | 'Housekeeping'
  | 'Restaurant'
  | 'Bar'
  | 'Banquet & Convention'
  | 'Activities'
  | 'Amenities'
  | 'Procurement'
  | 'Inventory'
  | 'Menu & Costing'
  | 'Sales & Marketing'
  | 'Accounts Receivable'
  | 'Accounts Payable'
  | 'General Ledger'
  | 'Financial Reports'
  | 'Tax & Compliance'
  | 'Management Reports'
  | 'Audit Reports'
  | 'Custom Reports';

export interface ReportDefinition {
  id: string;
  reportCode: string;
  reportName: string;
  module: MainModuleName;
  subModule: string;
  category: ReportCategory;
  description: string;
  dataSource: string;
  requiredPermission: string;
  defaultDataScope: DataScopeType;
  supportedFormats: ('PDF' | 'Excel' | 'CSV' | 'Print')[];
  columns: ReportColumnDef[];
}

export interface ReportColumnDef {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  format?: 'currency' | 'percent' | 'date' | 'badge' | 'number' | 'text';
  isTotal?: boolean;
}

export interface ReportFilterState {
  dateFrom: string;
  dateTo: string;
  department?: string;
  outletId?: string;
  warehouseId?: string;
  status?: string;
  searchTerm?: string;
  groupBy?: string;
  category?: string;
  userId?: string;
  agingBucket?: string;
}

export interface ReportExecutionLog {
  id: string;
  reportCode: string;
  reportName: string;
  userId: string;
  userName: string;
  userRole: string;
  department: string;
  executedAt: string;
  filters: ReportFilterState;
  rowCount: number;
  exportFormat?: 'PDF' | 'Excel' | 'CSV' | 'View' | 'Print';
}
