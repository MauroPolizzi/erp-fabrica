import { Router } from 'express';
import { authenticate } from '../../auth/auth.middleware';
import { requirePermission } from '../../../shared/middlewares/permission';
import { salesCashController } from './sales-cash.controller';

// Caja de ventas — solo lectura (saldo + movimientos). Los movimientos los generan
// las ventas y sus anulaciones (finance.read).
export const salesCashRoutes = Router();

salesCashRoutes.use(authenticate);

salesCashRoutes.get('/', requirePermission('finance.read'), salesCashController.getRegister);
salesCashRoutes.get('/movements', requirePermission('finance.read'), salesCashController.listMovements);
