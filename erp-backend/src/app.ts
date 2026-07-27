import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { corsOptions } from './config/cors';
import { errorHandler, notFoundHandler } from './shared/middlewares/error-handler';

// Rutas de módulos
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { rolesRoutes } from './modules/roles/roles.routes';
import { employeesRoutes } from './modules/employees/employees.routes';
import { categoriesRoutes } from './modules/inventory/categories/categories.routes';
import { rawMaterialsRoutes } from './modules/inventory/raw-materials/raw-materials.routes';
import { finishedProductsRoutes } from './modules/inventory/finished-products/finished-products.routes';
import { productionRoutes } from './modules/production/production.routes';
import { customersRoutes } from './modules/commercial/customers/customers.routes';
import { suppliersRoutes } from './modules/commercial/suppliers/suppliers.routes';
import { salesRoutes } from './modules/commercial/sales/sales.routes';
import { salesCashRoutes } from './modules/finance/sales-cash/sales-cash.routes';
import { paymentsRoutes } from './modules/finance/payments/payments.routes';
import { invoicingRoutes } from './modules/finance/invoicing/invoicing.routes';
import { reportsRoutes } from './modules/reports/reports.routes';
import { auditRoutes } from './modules/audit/audit.routes';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 1000 }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  const api = express.Router();
  api.use('/auth', authRoutes);
  api.use('/users', usersRoutes);
  api.use('/roles', rolesRoutes);
  api.use('/employees', employeesRoutes);
  api.use('/categories', categoriesRoutes);
  api.use('/inventory/raw-materials', rawMaterialsRoutes);
  api.use('/inventory/finished-products', finishedProductsRoutes);
  api.use('/production', productionRoutes);
  api.use('/commercial/customers', customersRoutes);
  api.use('/commercial/suppliers', suppliersRoutes);
  api.use('/commercial/sales', salesRoutes);
  api.use('/finance/sales-cash', salesCashRoutes);
  api.use('/finance/payments', paymentsRoutes);
  api.use('/finance/invoicing', invoicingRoutes);
  api.use('/reports', reportsRoutes);
  api.use('/audit', auditRoutes);

  app.use('/api', api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
