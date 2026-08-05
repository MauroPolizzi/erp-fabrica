/**
 * Modelos de dominio (espejo de los DTO del backend).
 * Los montos llegan como string (Decimal serializado): se muestran como string
 * y se parsean con decimal.js solo para previsualizar totales. El backend es la autoridad.
 *
 * La paginación reutiliza PageMeta / PagedResponse de core/services/api.service.ts.
 */

export interface Customer {
  id: string;
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

/** Rol con sus códigos de permiso (aplanados por el backend). Read-only. */
export interface Role {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  permissions: string[];
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  isActive: boolean;
}

export type CategoryType = 'RAW_MATERIAL' | 'FINISHED_PRODUCT';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
}

export interface FinishedProduct {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  unit: string;
  salePrice: string; // Decimal como string
  currentStock: string; // Decimal como string
  isActive: boolean;
}

export type MovementType = 'IN' | 'OUT' | 'ADJUST';

export interface FinishedProductMovement {
  id: string;
  type: MovementType;
  quantity: string;
  reference?: string;
  createdAt: string;
}

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD' | 'CHECK' | 'ACCOUNT';
export type SaleStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface SaleItemInput {
  finishedProductId: string;
  quantity: string;
}

export interface SaleDetail {
  id: string;
  finishedProductId: string;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
}

/** Datos mínimos del cliente embebidos en la venta (saleInclude del backend). */
export interface SaleCustomer {
  id: string;
  name: string;
  taxId?: string;
}

/** Usuario que registró la venta (embebido; null en ventas previas a la trazabilidad). */
export interface SaleCreatedBy {
  id: string;
  fullName: string;
}

export interface Sale {
  id: string;
  customerId: string;
  soldAt: string;
  status: SaleStatus;
  paymentMethod: PaymentMethod;
  subtotal: string;
  tax: string;
  total: string;
  customer?: SaleCustomer;
  createdBy?: SaleCreatedBy | null;
  details: SaleDetail[];
}
