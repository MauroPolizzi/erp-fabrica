/**
 * Test E2E del flujo de la demo (F5): login → cliente → material → stock → venta.
 *
 * Requiere infraestructura real:
 *   - PostgreSQL accesible (DATABASE_URL).
 *   - Seed aplicado (usuario admin@perlinor.local / admin123 y categorías).
 * Ejecutar: `pnpm --filter erp-backend db:seed` y luego `pnpm --filter erp-backend test`.
 *
 * El test crea sus propios datos con SKU/documento únicos y los limpia al final.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/database';

const app = createApp();
const suffix = Date.now();

let token: string;
let categoryId: string;
let customerId: string;
let productId: string;

const auth = () => ({ Authorization: `Bearer ${token}` });

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@perlinor.local', password: 'admin123' });
  expect(res.status).toBe(200);
  token = res.body.data.accessToken;

  const cats = await request(app)
    .get('/api/categories?type=FINISHED_PRODUCT')
    .set(auth());
  expect(cats.status).toBe(200);
  expect(cats.body.data.length).toBeGreaterThan(0);
  categoryId = cats.body.data[0].id;
});

afterAll(async () => {
  // Limpieza en orden de dependencias (SaleDetail cae por cascade al borrar Sale).
  if (productId) await prisma.finishedProductMovement.deleteMany({ where: { finishedProductId: productId } });
  if (customerId) await prisma.cashMovement.deleteMany({ where: { sale: { customerId } } });
  if (customerId) await prisma.sale.deleteMany({ where: { customerId } });
  if (productId) await prisma.finishedProduct.deleteMany({ where: { id: productId } });
  if (customerId) await prisma.customer.deleteMany({ where: { id: customerId } });
  await prisma.$disconnect();
});

describe('Auth', () => {
  it('rechaza credenciales inválidas con 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@perlinor.local', password: 'mala' });
    expect(res.status).toBe(401);
  });
});

describe('Flujo de venta E2E', () => {
  it('crea un cliente', async () => {
    const res = await request(app)
      .post('/api/commercial/customers')
      .set(auth())
      .send({ name: `Cliente Demo ${suffix}`, taxId: `30${suffix}` });
    expect(res.status).toBe(201);
    customerId = res.body.data.id;
    expect(res.body.data.isActive).toBe(true);
  });

  it('crea un material con stock inicial 0', async () => {
    const res = await request(app)
      .post('/api/inventory/finished-products')
      .set(auth())
      .send({ sku: `CEM-${suffix}`, name: 'Cemento Portland 50kg', categoryId, unit: 'BOLSA', salePrice: 8500 });
    expect(res.status).toBe(201);
    productId = res.body.data.id;
    expect(res.body.data.currentStock).toBe('0');
  });

  it('carga stock inicial con un movimiento IN', async () => {
    const res = await request(app)
      .post(`/api/inventory/finished-products/${productId}/movements`)
      .set(auth())
      .send({ type: 'IN', quantity: 100, reference: 'Stock inicial' });
    expect(res.status).toBe(201);
    expect(res.body.data.currentStock).toBe('100');
  });

  it('registra una venta y descuenta el stock', async () => {
    const res = await request(app)
      .post('/api/commercial/sales')
      .set(auth())
      .send({ customerId, paymentMethod: 'CASH', items: [{ finishedProductId: productId, quantity: 5 }] });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('CONFIRMED');
    expect(res.body.data.total).toBe('42500'); // Prisma.Decimal normaliza ceros finales
    expect(res.body.data.details).toHaveLength(1);
    expect(res.body.data.details[0].lineTotal).toBe('42500');

    const prod = await request(app).get(`/api/inventory/finished-products/${productId}`).set(auth());
    expect(prod.body.data.currentStock).toBe('95');
  });

  it('rechaza venta sin stock con 422 y no deja efectos (rollback)', async () => {
    const salesBefore = await prisma.sale.count({ where: { customerId } });
    const movementsBefore = await prisma.finishedProductMovement.count({ where: { finishedProductId: productId } });

    const res = await request(app)
      .post('/api/commercial/sales')
      .set(auth())
      .send({ customerId, paymentMethod: 'CASH', items: [{ finishedProductId: productId, quantity: 1000 }] });
    expect(res.status).toBe(422);

    const prod = await request(app).get(`/api/inventory/finished-products/${productId}`).set(auth());
    expect(prod.body.data.currentStock).toBe('95'); // sin cambios

    expect(await prisma.sale.count({ where: { customerId } })).toBe(salesBefore);
    expect(await prisma.finishedProductMovement.count({ where: { finishedProductId: productId } })).toBe(movementsBefore);
  });

  // Anti-oversell (D1/R1): dos ventas simultáneas que juntas exceden el stock.
  // Stock en este punto: 95. Dos ventas concurrentes de 50 c/u (total 100 > 95):
  // el decremento atómico condicional debe confirmar exactamente una y rechazar la otra,
  // sin que el stock quede negativo. (Sin el fix, ambas leerían 95 y sobre-venderían a -5.)
  it('ante dos ventas simultáneas que exceden el stock, solo una se confirma', async () => {
    const buy = () =>
      request(app)
        .post('/api/commercial/sales')
        .set(auth())
        .send({ customerId, paymentMethod: 'CASH', items: [{ finishedProductId: productId, quantity: 50 }] });

    const [a, b] = await Promise.all([buy(), buy()]);

    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([201, 422]); // exactamente una OK y una rechazada

    const prod = await request(app).get(`/api/inventory/finished-products/${productId}`).set(auth());
    expect(prod.body.data.currentStock).toBe('45'); // 95 - 50, nunca negativo
  });
});

// Anulación (D3/R4) + caja de ventas (R3): repone stock, revierte la caja e impide
// anular dos veces. Stock en este punto: 45. Los asserts de caja son relativos al
// saldo previo (la caja es compartida), así que no dependen de residuo de otras corridas.
describe('Anulación de venta + caja', () => {
  let cancelSaleId: string;
  let cajaBefore = 0;

  it('crea una venta: descuenta stock (45 → 40) y suma a la caja de ventas', async () => {
    const reg = await prisma.cashRegister.findFirst({ where: { type: 'SALES' } });
    cajaBefore = Number(reg!.balance);

    const res = await request(app)
      .post('/api/commercial/sales')
      .set(auth())
      .send({ customerId, paymentMethod: 'CASH', items: [{ finishedProductId: productId, quantity: 5 }] });
    expect(res.status).toBe(201);
    cancelSaleId = res.body.data.id;

    const prod = await request(app).get(`/api/inventory/finished-products/${productId}`).set(auth());
    expect(prod.body.data.currentStock).toBe('40');

    const regAfter = await prisma.cashRegister.findFirst({ where: { type: 'SALES' } });
    expect(Number(regAfter!.balance)).toBe(cajaBefore + 42500); // 5 × 8500
  });

  it('anula la venta: repone el stock (40 → 45) y revierte la caja', async () => {
    const res = await request(app)
      .patch(`/api/commercial/sales/${cancelSaleId}/cancel`)
      .set(auth())
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');

    const prod = await request(app).get(`/api/inventory/finished-products/${productId}`).set(auth());
    expect(prod.body.data.currentStock).toBe('45'); // stock repuesto

    const reg = await prisma.cashRegister.findFirst({ where: { type: 'SALES' } });
    expect(Number(reg!.balance)).toBe(cajaBefore); // caja vuelve al estado previo
  });

  it('rechaza anular una venta ya anulada con 422', async () => {
    const res = await request(app)
      .patch(`/api/commercial/sales/${cancelSaleId}/cancel`)
      .set(auth())
      .send({});
    expect(res.status).toBe(422);
  });
});
