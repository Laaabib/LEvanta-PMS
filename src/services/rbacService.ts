import { RoleDefinition, MainModuleName, DepartmentName, DataScopeType } from '../types/reportingAndRbac';

export interface UserContext {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  department: DepartmentName;
  dataScope: DataScopeType;
  outletId?: string;
  avatar?: string;
}

export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: 'role-super-admin',
    name: 'Super Administrator',
    department: 'Executive Management',
    description: 'Unrestricted enterprise access to all resort modules, financial books, settings, and audits.',
    isSystem: true,
    defaultDataScope: 'All Properties',
    allowedModules: [
      'dashboard', 'front-office', 'housekeeping', 'restaurant', 'bar', 'banquet',
      'activities', 'amenities', 'procurement', 'inventory', 'menu-management',
      'finance', 'sales-marketing', 'crm', 'hr', 'reports', 'administration'
    ],
    permissions: ['*']
  },
  {
    id: 'role-gm',
    name: 'General Manager',
    department: 'Executive Management',
    description: 'Executive management oversight, full reporting access, approvals, and operational dashboards.',
    isSystem: true,
    defaultDataScope: 'Own Property',
    allowedModules: [
      'dashboard', 'front-office', 'housekeeping', 'restaurant', 'bar', 'banquet',
      'activities', 'amenities', 'procurement', 'inventory', 'menu-management',
      'finance', 'sales-marketing', 'crm', 'hr', 'reports', 'administration'
    ],
    permissions: [
      'view:*', 'approve:*', 'export:*', 'print:*',
      'Reports.View', 'Reports.Management.View', 'Reports.Financial.View',
      'Reports.ExportExcel', 'Reports.ExportPDF', 'Reports.Print'
    ]
  },
  {
    id: 'role-finance-mgr',
    name: 'Finance Manager',
    department: 'Finance & Accounts',
    description: 'Full control over General Ledger, AR, AP, Cash & Bank, Tax, and Financial Statements.',
    isSystem: true,
    defaultDataScope: 'Own Property',
    allowedModules: ['dashboard', 'finance', 'procurement', 'reports', 'administration'],
    permissions: [
      'finance:*', 'procurement:view', 'procurement:approve', 'reports:finance',
      'Reports.AR.View', 'Reports.AP.View', 'Reports.GL.View', 'Reports.Financial.View',
      'Reports.Tax.View', 'Reports.ExportExcel', 'Reports.ExportPDF', 'Reports.Print'
    ]
  },
  {
    id: 'role-accounts-exec',
    name: 'Accounts Executive',
    department: 'Finance & Accounts',
    description: 'Day-to-day book-keeping, journal posting, cashier settlements, and voucher verification.',
    isSystem: false,
    defaultDataScope: 'Own Department',
    allowedModules: ['dashboard', 'finance', 'reports'],
    permissions: [
      'finance:view', 'finance:create', 'finance:edit', 'finance:post',
      'Reports.AR.View', 'Reports.AP.View', 'Reports.GL.View', 'Reports.Print'
    ]
  },
  {
    id: 'role-fo-mgr',
    name: 'Front Office Manager',
    department: 'Front Office',
    description: 'Manages reservations, check-ins/outs, room rate overrides, night audits, and front desk staff.',
    isSystem: true,
    defaultDataScope: 'Own Department',
    allowedModules: ['dashboard', 'front-office', 'crm', 'reports'],
    permissions: [
      'front-office:*', 'crm:*', 'night-audit:run',
      'Reports.FrontOffice.View', 'Reports.ExportExcel', 'Reports.Print'
    ]
  },
  {
    id: 'role-fo-exec',
    name: 'Front Desk Executive',
    department: 'Front Office',
    description: 'Guest arrivals, departures, room assignments, key issuance, and folio settlements.',
    isSystem: false,
    defaultDataScope: 'Own Records',
    allowedModules: ['dashboard', 'front-office', 'crm', 'reports'],
    permissions: [
      'front-office:view', 'front-office:create', 'front-office:edit',
      'Reports.FrontOffice.View', 'Reports.Print'
    ]
  },
  {
    id: 'role-hk-mgr',
    name: 'Housekeeping Manager',
    department: 'Housekeeping',
    description: 'Manages room cleaning boards, linen stock, amenities, inspections, and lost & found.',
    isSystem: true,
    defaultDataScope: 'Own Department',
    allowedModules: ['dashboard', 'housekeeping', 'amenities', 'reports'],
    permissions: [
      'housekeeping:*', 'amenities:*',
      'Reports.Housekeeping.View', 'Reports.Amenity.View', 'Reports.Print'
    ]
  },
  {
    id: 'role-hk-exec',
    name: 'Housekeeping Executive',
    department: 'Housekeeping',
    description: 'Room cleaning updates, inspection logs, linen changes, and guest request fulfillment.',
    isSystem: false,
    defaultDataScope: 'Own Records',
    allowedModules: ['dashboard', 'housekeeping'],
    permissions: ['housekeeping:view', 'housekeeping:edit']
  },
  {
    id: 'role-rest-mgr',
    name: 'Restaurant Manager',
    department: 'Restaurant',
    description: 'Restaurant dining management, menu pricing, recipe approval, table management, and reports.',
    isSystem: true,
    defaultDataScope: 'Own Outlet',
    allowedModules: ['dashboard', 'restaurant', 'menu-management', 'reports'],
    permissions: [
      'restaurant:*', 'menu:*',
      'Reports.Restaurant.View', 'Reports.Menu.View', 'Reports.Print'
    ]
  },
  {
    id: 'role-rest-sup',
    name: 'Restaurant Supervisor',
    department: 'Restaurant',
    description: 'Floor supervision, KOT management, order modifications, discount authorization.',
    isSystem: false,
    defaultDataScope: 'Own Outlet',
    allowedModules: ['dashboard', 'restaurant'],
    permissions: ['restaurant:view', 'restaurant:create', 'restaurant:edit', 'restaurant:discount']
  },
  {
    id: 'role-rest-cashier',
    name: 'Restaurant Cashier',
    department: 'Restaurant',
    description: 'Takes POS orders, executes billing, handles guest payment settlements, and prints receipts.',
    isSystem: false,
    defaultDataScope: 'Own Outlet',
    allowedModules: ['restaurant', 'reports'],
    permissions: ['restaurant:pos', 'restaurant:bill', 'Reports.Restaurant.View']
  },
  {
    id: 'role-bar-mgr',
    name: 'Bar Manager',
    department: 'Bar & Lounge',
    description: 'Bar counter supervision, bottle inventory consumption, drink recipes, and beverage cost control.',
    isSystem: true,
    defaultDataScope: 'Own Outlet',
    allowedModules: ['dashboard', 'bar', 'menu-management', 'reports'],
    permissions: ['bar:*', 'menu:*', 'Reports.Bar.View', 'Reports.Print']
  },
  {
    id: 'role-bar-sup',
    name: 'Bar Supervisor',
    department: 'Bar & Lounge',
    description: 'Bar shift management, POS order dispatch, drink customization, and void authoring.',
    isSystem: false,
    defaultDataScope: 'Own Outlet',
    allowedModules: ['dashboard', 'bar'],
    permissions: ['bar:view', 'bar:pos', 'bar:void']
  },
  {
    id: 'role-banquet-mgr',
    name: 'Banquet Manager',
    department: 'Banquet & Convention',
    description: 'Banquet hall bookings, convention packages, function sheets, event billing, and catering.',
    isSystem: true,
    defaultDataScope: 'Own Department',
    allowedModules: ['dashboard', 'banquet', 'reports'],
    permissions: ['banquet:*', 'Reports.Banquet.View', 'Reports.Print']
  },
  {
    id: 'role-banquet-exec',
    name: 'Banquet Executive',
    department: 'Banquet & Convention',
    description: 'Event setups, function sheet tracking, client coordination, and hall scheduling.',
    isSystem: false,
    defaultDataScope: 'Own Department',
    allowedModules: ['dashboard', 'banquet'],
    permissions: ['banquet:view', 'banquet:create', 'banquet:edit']
  },
  {
    id: 'role-act-mgr',
    name: 'Activities Manager',
    department: 'Recreation & Activities',
    description: 'Resort amenities, pool, sports, games, boat rides, wellness bookings, and equipment rentals.',
    isSystem: true,
    defaultDataScope: 'Own Department',
    allowedModules: ['dashboard', 'activities', 'amenities', 'reports'],
    permissions: ['activities:*', 'amenities:*', 'Reports.Activity.View', 'Reports.Print']
  },
  {
    id: 'role-proc-mgr',
    name: 'Procurement Manager',
    department: 'Procurement & Stores',
    description: 'Purchase requisitions, vendor purchase orders, GRN verification, price approvals, and supplier contracts.',
    isSystem: true,
    defaultDataScope: 'Own Department',
    allowedModules: ['dashboard', 'procurement', 'inventory', 'reports'],
    permissions: [
      'procurement:*', 'inventory:view',
      'Reports.Procurement.View', 'Reports.Inventory.View', 'Reports.Print'
    ]
  },
  {
    id: 'role-proc-exec',
    name: 'Procurement Executive',
    department: 'Procurement & Stores',
    description: 'Creates PO drafts, tracks RFQs, registers incoming shipments, and verifies challans.',
    isSystem: false,
    defaultDataScope: 'Own Department',
    allowedModules: ['dashboard', 'procurement'],
    permissions: ['procurement:view', 'procurement:create', 'procurement:edit']
  },
  {
    id: 'role-store-mgr',
    name: 'Store Manager',
    department: 'Inventory',
    description: 'Central warehouse stock control, inter-store transfers, stock audits, wastage logs, and valuation.',
    isSystem: true,
    defaultDataScope: 'Own Department',
    allowedModules: ['dashboard', 'inventory', 'procurement', 'reports'],
    permissions: [
      'inventory:*', 'procurement:view',
      'Reports.Inventory.View', 'Reports.Print', 'Reports.ExportExcel'
    ]
  },
  {
    id: 'role-storekeeper',
    name: 'Storekeeper',
    department: 'Inventory',
    description: 'Item receipts, physical counting, stock issue slips to departments, and bin tracking.',
    isSystem: false,
    defaultDataScope: 'Own Records',
    allowedModules: ['inventory'],
    permissions: ['inventory:view', 'inventory:issue', 'inventory:count']
  },
  {
    id: 'role-sales-mgr',
    name: 'Sales Manager',
    department: 'Sales & Marketing',
    description: 'Corporate client contracts, travel agents, promotions, event leads, and pipeline reports.',
    isSystem: true,
    defaultDataScope: 'Own Department',
    allowedModules: ['dashboard', 'sales-marketing', 'crm', 'reports'],
    permissions: ['sales:*', 'crm:*', 'Reports.Sales.View', 'Reports.Print']
  },
  {
    id: 'role-sales-exec',
    name: 'Sales Executive',
    department: 'Sales & Marketing',
    description: 'Client follow-ups, inquiry logging, quotations, and corporate booking coordination.',
    isSystem: false,
    defaultDataScope: 'Own Records',
    allowedModules: ['sales-marketing', 'crm'],
    permissions: ['sales:view', 'sales:create', 'sales:edit']
  },
  {
    id: 'role-hr-mgr',
    name: 'HR Manager',
    department: 'Human Resources',
    description: 'Staff directory, department assignments, shift rosters, attendance, and leave management.',
    isSystem: true,
    defaultDataScope: 'Own Department',
    allowedModules: ['dashboard', 'hr', 'administration', 'reports'],
    permissions: ['hr:*', 'admin:users', 'Reports.HR.View']
  },
  {
    id: 'role-auditor',
    name: 'Auditor',
    department: 'Internal Audit',
    description: 'Independent audit view of all transactions, journal vouchers, void logs, price changes, and system history.',
    isSystem: true,
    defaultDataScope: 'All Properties',
    allowedModules: ['dashboard', 'reports', 'finance', 'inventory', 'administration'],
    permissions: [
      'view:*', 'Reports.Audit.View', 'Reports.Financial.View',
      'Reports.ExportExcel', 'Reports.ExportPDF', 'Reports.Print'
    ]
  },
  {
    id: 'role-report-viewer',
    name: 'Report Viewer',
    department: 'Executive Management',
    description: 'Read-only access to operational, financial, and analytical management reports.',
    isSystem: false,
    defaultDataScope: 'Own Property',
    allowedModules: ['dashboard', 'reports'],
    permissions: ['Reports.View', 'Reports.Print']
  }
];

export const INITIAL_STAFF_USERS: UserContext[] = [
  {
    id: 'usr-admin-1',
    name: 'Engr. Subrata Roy',
    email: 'subrata.admin@cculb.org',
    roleId: 'role-super-admin',
    roleName: 'Super Administrator',
    department: 'Executive Management',
    dataScope: 'All Properties',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'usr-gm-1',
    name: 'Brig. Gen. (Retd.) M. Rahman',
    email: 'gm@cculbresort.com',
    roleId: 'role-gm',
    roleName: 'General Manager',
    department: 'Executive Management',
    dataScope: 'Own Property',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'usr-fin-1',
    name: 'Tariqul Islam, FCA',
    email: 'finance.head@cculbresort.com',
    roleId: 'role-finance-mgr',
    roleName: 'Finance Manager',
    department: 'Finance & Accounts',
    dataScope: 'Own Property',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'usr-fo-1',
    name: 'Shamima Akter',
    email: 'fom@cculbresort.com',
    roleId: 'role-fo-mgr',
    roleName: 'Front Office Manager',
    department: 'Front Office',
    dataScope: 'Own Department',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'usr-rest-1',
    name: 'Kazi Farhan',
    email: 'dining.mgr@cculbresort.com',
    roleId: 'role-rest-mgr',
    roleName: 'Restaurant Manager',
    department: 'Restaurant',
    dataScope: 'Own Outlet',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'usr-chef-1',
    name: 'Chef Mohammad Ali',
    email: 'executive.chef@cculbresort.com',
    roleId: 'role-rest-mgr',
    roleName: 'Restaurant Manager',
    department: 'Kitchen / Culinary',
    dataScope: 'Own Department',
    avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'usr-bar-1',
    name: 'Tanvir Hossain',
    email: 'bar.supervisor@cculbresort.com',
    roleId: 'role-bar-mgr',
    roleName: 'Bar Manager',
    department: 'Bar & Lounge',
    dataScope: 'Own Outlet',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'usr-hk-1',
    name: 'Rasheda Begum',
    email: 'housekeeping.head@cculbresort.com',
    roleId: 'role-hk-mgr',
    roleName: 'Housekeeping Manager',
    department: 'Housekeeping',
    dataScope: 'Own Department',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'usr-proc-1',
    name: 'Enamul Haque',
    email: 'procurement@cculbresort.com',
    roleId: 'role-proc-mgr',
    roleName: 'Procurement Manager',
    department: 'Procurement & Stores',
    dataScope: 'Own Department',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'usr-store-1',
    name: 'Kamrul Hasan',
    email: 'central.store@cculbresort.com',
    roleId: 'role-store-mgr',
    roleName: 'Store Manager',
    department: 'Inventory',
    dataScope: 'Own Department',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'usr-audit-1',
    name: 'Advocate N. H. Chowdhury',
    email: 'lead.auditor@cculb.org',
    roleId: 'role-auditor',
    roleName: 'Auditor',
    department: 'Internal Audit',
    dataScope: 'All Properties',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=60'
  }
];

class RbacManager {
  private roles: RoleDefinition[] = [];
  private users: UserContext[] = [];
  private activeUser: UserContext;

  constructor() {
    const savedRoles = localStorage.getItem('cculb_roles_v1');
    this.roles = savedRoles ? JSON.parse(savedRoles) : DEFAULT_ROLES;

    const savedUsers = localStorage.getItem('cculb_rbac_users_v1');
    this.users = savedUsers ? JSON.parse(savedUsers) : INITIAL_STAFF_USERS;

    const savedActiveUserId = localStorage.getItem('cculb_active_user_id');
    const foundUser = this.users.find(u => u.id === savedActiveUserId);
    this.activeUser = foundUser || this.users[0];
  }

  public getRoles(): RoleDefinition[] {
    return this.roles;
  }

  public getUsers(): UserContext[] {
    return this.users;
  }

  public getActiveUser(): UserContext {
    return this.activeUser;
  }

  public setActiveUser(userId: string): UserContext {
    const u = this.users.find(x => x.id === userId);
    if (u) {
      this.activeUser = u;
      localStorage.setItem('cculb_active_user_id', userId);
    }
    return this.activeUser;
  }

  public getActiveRole(): RoleDefinition {
    const r = this.roles.find(x => x.id === this.activeUser.roleId);
    return r || this.roles[0];
  }

  public isModuleAllowed(module: MainModuleName): boolean {
    const role = this.getActiveRole();
    if (role.permissions.includes('*')) return true;
    return role.allowedModules.includes(module);
  }

  public hasPermission(permission: string): boolean {
    const role = this.getActiveRole();
    if (role.permissions.includes('*')) return true;
    if (role.permissions.includes(permission)) return true;

    // Check wildcard prefix e.g. "reports:*" matches "reports:finance"
    const prefix = permission.split(':')[0] + ':*';
    if (role.permissions.includes(prefix)) return true;

    return false;
  }

  public isReportAllowed(reportPermission: string, reportCategory: string): boolean {
    const role = this.getActiveRole();
    if (role.permissions.includes('*')) return true;
    if (role.permissions.includes('Reports.View') || role.permissions.includes(reportPermission)) {
      return true;
    }

    // Check department match
    const dept = this.activeUser.department;
    if (dept === 'Executive Management' || dept === 'Internal Audit') return true;
    if (dept === 'Finance & Accounts' && ['Accounts Receivable', 'Accounts Payable', 'General Ledger', 'Financial Reports', 'Tax & Compliance'].includes(reportCategory)) return true;
    if (dept === 'Front Office' && reportCategory === 'Front Office') return true;
    if (dept === 'Housekeeping' && reportCategory === 'Housekeeping') return true;
    if ((dept === 'Restaurant' || dept === 'Food & Beverage') && ['Restaurant', 'Menu & Costing'].includes(reportCategory)) return true;
    if (dept === 'Bar & Lounge' && reportCategory === 'Bar') return true;
    if (dept === 'Banquet & Convention' && reportCategory === 'Banquet & Convention') return true;
    if (dept === 'Procurement & Stores' && reportCategory === 'Procurement') return true;
    if (dept === 'Inventory' && reportCategory === 'Inventory') return true;

    return false;
  }

  public updateRole(updatedRole: RoleDefinition) {
    this.roles = this.roles.map(r => r.id === updatedRole.id ? updatedRole : r);
    localStorage.setItem('cculb_roles_v1', JSON.stringify(this.roles));
  }

  public addRole(newRole: Omit<RoleDefinition, 'id'>): RoleDefinition {
    const role: RoleDefinition = {
      ...newRole,
      id: `role-${Date.now()}`
    };
    this.roles.push(role);
    localStorage.setItem('cculb_roles_v1', JSON.stringify(this.roles));
    return role;
  }
}

export const rbacService = new RbacManager();
