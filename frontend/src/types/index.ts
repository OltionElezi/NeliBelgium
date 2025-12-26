export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface Company {
  id: number;
  name: string;
  ownerName: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  taxId: string;
  bankAccount: string;
  bankCode: string;
  email: string;
  phone?: string;
  logo?: string;
  invoicePrefix: string;
  nextInvoiceNum: number;
  btwNumber?: string;
}

export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country: string;
  btwNumber?: string;
  notes?: string;
  invoices?: Invoice[];
  createdAt: string;
  deletedAt?: string;
}

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number | string;
  total: number | string;
  productId?: number;
  costPrice?: number | string;
  profit?: number | string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  client: Client;
  clientId: number;
  items: InvoiceItem[];
  subtotal: string;
  btwRate: string;
  btwAmount: string;
  total: string;
  status: InvoiceStatus;
  notes?: string;
  issueDate: string;
  dueDate?: string;
  paidAt?: string;
  sentAt?: string;
  createdAt: string;
  deletedAt?: string;
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Worker {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  role?: string;
  expenses?: Expense[];
  totalExpenses?: string;
  createdAt: string;
  deletedAt?: string;
}

export interface Expense {
  id: number;
  workerId: number;
  worker?: { id: number; name: string };
  amount: string;
  description?: string;
  category?: string;
  date: string;
  createdAt: string;
  deletedAt?: string;
}

export interface TrashItem {
  id: number;
  type: 'client' | 'invoice' | 'worker' | 'expense' | 'product' | 'companyExpense';
  daysRemaining: number;
  expiresAt: string;
  deletedAt: string;
  [key: string]: any;
}

export interface TrashData {
  clients: TrashItem[];
  invoices: TrashItem[];
  workers: TrashItem[];
  expenses: TrashItem[];
  products: TrashItem[];
  companyExpenses: TrashItem[];
  summary: {
    totalClients: number;
    totalInvoices: number;
    totalWorkers: number;
    totalExpenses: number;
    totalProducts: number;
    totalCompanyExpenses: number;
    total: number;
  };
}

export interface DashboardStats {
  clients: number;
  invoices: number;
  workers: number;
  revenue: {
    paid: string;
    pending: string;
  };
  expenses: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  priceBuying: string;
  priceSelling: string;
  stock: number;
  unit: string;
  category?: string;
  profit?: string;
  marginPercent?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CompanyExpense {
  id: number;
  amount: string;
  description?: string;
  category: string;
  vendor?: string;
  reference?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// ============ ELECTRICAL PROJECT TYPES ============

export type DiagramType = 'FLOOR_PLAN' | 'DISTRIBUTION_BOARD' | 'CIRCUIT';

export interface ElectricalProject {
  id: number;
  name: string;
  description?: string;
  client: Client;
  clientId: number;
  address?: string;
  diagrams: ElectricalDiagram[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ElectricalDiagram {
  id: number;
  projectId: number;
  name: string;
  type: DiagramType;
  diagramData: DiagramData;
  pageIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiagramData {
  canvas: CanvasSettings;
  elements: DiagramElement[];
  connections: Connection[];
  metadata?: DiagramMetadata;
}

export interface CanvasSettings {
  width: number;
  height: number;
  gridSize: number;
  gridVisible: boolean;
  snapToGrid: boolean;
  scale: number;
  offsetX: number;
  offsetY: number;
  backgroundColor: string;
}

export interface DiagramElement {
  id: string;
  type: string;  // 'outlet', 'switch', 'light', 'breaker', 'wall', 'room', 'text', 'label', 'wire'
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  properties: Record<string, any>;
  style?: ElementStyle;
  layerId?: string;
}

export interface ElementStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  fontSize?: number;
  fontFamily?: string;
}

export interface Connection {
  id: string;
  fromElementId?: string;
  toElementId?: string;
  points: number[];  // [x1, y1, x2, y2, ...]
  strokeColor: string;
  strokeWidth: number;
  dashed?: boolean;
  wireType?: 'power' | 'neutral' | 'ground' | 'data';
}

export interface DiagramMetadata {
  title?: string;
  createdAt?: string;
  modifiedAt?: string;
  notes?: string;
}

export interface ElectricalSymbol {
  id: string;
  name: string;
  category: string;
  icon: string;  // SVG path or component name
  defaultWidth: number;
  defaultHeight: number;
  properties?: Record<string, any>;
}
