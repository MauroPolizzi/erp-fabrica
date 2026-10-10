/**
 * Filtro de fechas de la caja de ventas, y `parseDay` compartido por ventas y auditoría.
 *
 * Requiere infraestructura real, igual que sales-flow.test.ts:
 *   - PostgreSQL accesible (DATABASE_URL de .env.test) con las migraciones aplicadas.
 *   - Seed aplicado (hace falta la caja de ventas y el usuario admin).
 * Ejecutar: `pnpm --filter erp-backend db:test:setup` y luego `pnpm --filter erp-backend test`.
 *
 * Crea dos movimientos con fechas conocidas (uno de hoy y uno de hace 10 días) para no
 * depender de los datos que haya en la base, y los borra al final.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import dayjs from 'dayjs';
import { createApp } from '../src/app';
import { prisma } from '../src/config/database';

const app = createApp();
const TODAY = dayjs().format('YYYY-MM-DD');
const TEN_DAYS_AGO = dayjs().subtract(10, 'day').format('YYYY-MM-DD');
const FUTURE = dayjs().add(5, 'year').format('YYYY-MM-DD');

let token: string;
let registerId: string;
const createdIds: string[] = [];

const auth = () => ({ Authorization: `Bearer ${token}` });

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@perlinor.local', password: 'admin123' });
  expect(res.status).toBe(200);
  token = res.body.data.accessToken;

  const register = await prisma.cashRegister.findFirst({ where: { type: 'SALES' } });
  registerId = register!.id;

  // Dos movimientos con fechas conocidas: uno de hoy y uno viejo.
  const hoy = await prisma.cashMovement.create({
    data: { cashRegisterId: registerId, amount: 111, description: 'F2.4 hoy' },
  });
  const viejo = await prisma.cashMovement.create({
    data: {
      cashRegisterId: registerId,
      amount: 222,
      description: 'F2.4 viejo',
      createdAt: dayjs().subtract(10, 'day').toDate(),
    },
  });
  createdIds.push(hoy.id, viejo.id);
});

afterAll(async () => {
  await prisma.cashMovement.deleteMany({ where: { id: { in: createdIds } } });
  await prisma.$disconnect();
});

function descriptions(body: { data: { description: string | null }[] }): (string | null)[] {
  return body.data.map((m) => m.description);
}

describe('Caja de ventas — filtro de fechas', () => {
  it('from=to=hoy devuelve el movimiento de hoy y excluye el viejo', async () => {
    const res = await request(app)
      .get('/api/finance/sales-cash/movements')
      .query({ from: TODAY, to: TODAY, limit: 100 })
      .set(auth());

    expect(res.status).toBe(200);
    const descs = descriptions(res.body);
    expect(descs).toContain('F2.4 hoy');
    expect(descs).not.toContain('F2.4 viejo');
  });

  it('un rango amplio incluye ambos', async () => {
    const res = await request(app)
      .get('/api/finance/sales-cash/movements')
      .query({ from: TEN_DAYS_AGO, to: TODAY, limit: 100 })
      .set(auth());

    expect(res.status).toBe(200);
    const descs = descriptions(res.body);
    expect(descs).toContain('F2.4 hoy');
    expect(descs).toContain('F2.4 viejo');
  });

  it('un rango futuro no devuelve nada', async () => {
    const res = await request(app)
      .get('/api/finance/sales-cash/movements')
      .query({ from: FUTURE, to: FUTURE, limit: 100 })
      .set(auth());

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
    expect(res.body.meta.total).toBe(0);
  });

  it('sin filtros sigue devolviendo el histórico completo', async () => {
    const res = await request(app)
      .get('/api/finance/sales-cash/movements')
      .query({ limit: 100 })
      .set(auth());

    expect(res.status).toBe(200);
    const descs = descriptions(res.body);
    expect(descs).toContain('F2.4 hoy');
    expect(descs).toContain('F2.4 viejo');
  });

  it('el saldo de la caja NO se ve afectado por el filtro del listado', async () => {
    const sinFiltro = await request(app).get('/api/finance/sales-cash').set(auth());
    const conFiltro = await request(app)
      .get('/api/finance/sales-cash')
      .query({ from: FUTURE, to: FUTURE })
      .set(auth());

    expect(sinFiltro.status).toBe(200);
    expect(conFiltro.body.data.balance).toBe(sinFiltro.body.data.balance);
  });
});

// El refactor movió parseDate de los controllers a shared/utils/date.ts (parseDay).
// Estos dos asserts confirman que ventas y auditoría siguen filtrando por fecha.
describe('parseDay compartido — ventas y auditoría', () => {
  it('ventas: un rango futuro devuelve lista vacía', async () => {
    const res = await request(app)
      .get('/api/commercial/sales')
      .query({ from: FUTURE, to: FUTURE, limit: 100 })
      .set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  it('auditoría: un rango futuro devuelve lista vacía, uno amplio no', async () => {
    const futuro = await request(app)
      .get('/api/audit')
      .query({ from: FUTURE, to: FUTURE, limit: 100 })
      .set(auth());
    expect(futuro.status).toBe(200);
    expect(futuro.body.data.length).toBe(0);

    const amplio = await request(app)
      .get('/api/audit')
      .query({ from: TEN_DAYS_AGO, to: TODAY, limit: 100 })
      .set(auth());
    expect(amplio.status).toBe(200);
    expect(amplio.body.meta.total).toBeGreaterThan(0);
  });

  it('una fecha inválida se ignora en lugar de romper', async () => {
    const res = await request(app)
      .get('/api/finance/sales-cash/movements')
      .query({ from: 'no-es-fecha', limit: 100 })
      .set(auth());
    expect(res.status).toBe(200);
    expect(descriptions(res.body)).toContain('F2.4 viejo');
  });
});
