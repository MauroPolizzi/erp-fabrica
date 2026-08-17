/**
 * Test de integración del flujo de recuperación de contraseña (F1).
 *
 * Requiere infraestructura real, igual que sales-flow.test.ts:
 *   - PostgreSQL accesible (DATABASE_URL de .env.test) con las migraciones aplicadas.
 *   - Seed aplicado (hace falta al menos un Role).
 * Ejecutar: `pnpm --filter erp-backend db:test:setup` y luego `pnpm --filter erp-backend test`.
 *
 * El test usa un usuario propio (no el admin sembrado) para no romper el login de
 * las otras suites al cambiarle la contraseña.
 *
 * El token en claro solo existe en el mail, así que para los casos de reset la suite
 * inserta filas con un token conocido y su SHA-256 — que es exactamente lo que el
 * servicio espera encontrar en la base.
 */
import { createHash, randomBytes } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app';
import { prisma } from '../src/config/database';

const app = createApp();
const suffix = Date.now();
const email = `reset-test-${suffix}@perlinor.local`;
const ORIGINAL_PASSWORD = 'original123';
const NEW_PASSWORD = 'nuevaClave456';

let userId: string;

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

/** Emite un token de reset directamente en la base y devuelve el valor en claro. */
async function issueToken(options: { minutesFromNow?: number; used?: boolean } = {}) {
  const token = randomBytes(32).toString('hex');
  const minutes = options.minutesFromNow ?? 30;
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + minutes * 60_000),
      usedAt: options.used ? new Date() : null,
    },
  });
  return token;
}

const tokenCount = () => prisma.passwordResetToken.count({ where: { userId } });

beforeAll(async () => {
  const role = await prisma.role.findFirst();
  expect(role, 'La base de tests necesita el seed aplicado (no hay roles)').toBeTruthy();

  const user = await prisma.user.create({
    data: {
      email,
      fullName: `Usuario Reset ${suffix}`,
      passwordHash: await bcrypt.hash(ORIGINAL_PASSWORD, 10),
      roleId: role!.id,
    },
  });
  userId = user.id;
});

afterAll(async () => {
  if (userId) {
    await prisma.auditLog.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } }); // los tokens caen por cascade
  }
  await prisma.$disconnect();
});

describe('POST /auth/forgot-password', () => {
  it('responde 200 con un email inexistente y no emite ningún token', async () => {
    const before = await prisma.passwordResetToken.count();
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: `no-existe-${suffix}@perlinor.local` });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBeTruthy();
    expect(await prisma.passwordResetToken.count()).toBe(before);
  });

  it('rechaza un email mal formado con 400', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'no-es-un-mail' });
    expect(res.status).toBe(400);
  });

  it('emite un token para un email registrado y guarda solo su hash', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email });
    expect(res.status).toBe(200);

    const tokens = await prisma.passwordResetToken.findMany({ where: { userId } });
    expect(tokens).toHaveLength(1);
    expect(tokens[0].tokenHash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 en hex, no el token
    expect(tokens[0].usedAt).toBeNull();
    expect(tokens[0].expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('una nueva solicitud reemplaza el token anterior (solo vale el último link)', async () => {
    const previous = (await prisma.passwordResetToken.findFirst({ where: { userId } }))!.tokenHash;

    const res = await request(app).post('/api/auth/forgot-password').send({ email });
    expect(res.status).toBe(200);

    const tokens = await prisma.passwordResetToken.findMany({ where: { userId } });
    expect(tokens).toHaveLength(1);
    expect(tokens[0].tokenHash).not.toBe(previous);
  });

  it('responde el mismo 200 para un usuario inactivo, sin emitir token', async () => {
    await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
    await prisma.passwordResetToken.deleteMany({ where: { userId } });

    const res = await request(app).post('/api/auth/forgot-password').send({ email });
    expect(res.status).toBe(200);
    expect(await tokenCount()).toBe(0);

    await prisma.user.update({ where: { id: userId }, data: { isActive: true } });
  });
});

describe('GET /auth/reset-password/:token/validate', () => {
  it('devuelve valid=true para un token vigente', async () => {
    const token = await issueToken();
    const res = await request(app).get(`/api/auth/reset-password/${token}/validate`);
    expect(res.status).toBe(200);
    expect(res.body.data.valid).toBe(true);
  });

  it('devuelve valid=false para un token inexistente, expirado o ya usado', async () => {
    const inexistente = randomBytes(32).toString('hex');
    const expirado = await issueToken({ minutesFromNow: -1 });
    const usado = await issueToken({ used: true });

    for (const token of [inexistente, expirado, usado]) {
      const res = await request(app).get(`/api/auth/reset-password/${token}/validate`);
      expect(res.status).toBe(200);
      expect(res.body.data.valid).toBe(false);
    }
  });
});

describe('POST /auth/reset-password', () => {
  it('rechaza una contraseña de menos de 8 caracteres con 400', async () => {
    const token = await issueToken();
    const res = await request(app).post('/api/auth/reset-password').send({ token, password: 'corta' });
    expect(res.status).toBe(400);
  });

  it('rechaza un token expirado con 400 y no cambia la contraseña', async () => {
    const token = await issueToken({ minutesFromNow: -1 });
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: NEW_PASSWORD });

    expect(res.status).toBe(400);
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password: ORIGINAL_PASSWORD });
    expect(login.status).toBe(200);
  });

  it('rechaza el token de un usuario inactivo con 400', async () => {
    const token = await issueToken();
    await prisma.user.update({ where: { id: userId }, data: { isActive: false } });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: NEW_PASSWORD });
    expect(res.status).toBe(400);

    await prisma.user.update({ where: { id: userId }, data: { isActive: true } });
  });

  it('cambia la contraseña, invalida los demás tokens y deja auditoría', async () => {
    await prisma.passwordResetToken.deleteMany({ where: { userId } });
    const token = await issueToken();
    await issueToken(); // token paralelo: debe quedar invalidado

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: NEW_PASSWORD });
    expect(res.status).toBe(200);

    // Queda solo el token consumido, marcado como usado.
    const tokens = await prisma.passwordResetToken.findMany({ where: { userId } });
    expect(tokens).toHaveLength(1);
    expect(tokens[0].tokenHash).toBe(sha256(token));
    expect(tokens[0].usedAt).not.toBeNull();

    const audit = await prisma.auditLog.findFirst({
      where: { entity: 'User', entityId: userId, action: 'UPDATE' },
    });
    expect(audit).toBeTruthy();
    expect(audit!.newValues).toBeNull(); // nunca se audita el hash de la contraseña
  });

  it('permite iniciar sesión con la contraseña nueva y no con la anterior', async () => {
    const conNueva = await request(app)
      .post('/api/auth/login')
      .send({ email, password: NEW_PASSWORD });
    expect(conNueva.status).toBe(200);
    expect(conNueva.body.data.accessToken).toBeTruthy();

    const conVieja = await request(app)
      .post('/api/auth/login')
      .send({ email, password: ORIGINAL_PASSWORD });
    expect(conVieja.status).toBe(401);
  });

  it('rechaza reusar un token ya consumido con 400', async () => {
    const token = await issueToken();
    const primera = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: 'otraClave789' });
    expect(primera.status).toBe(200);

    const segunda = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: 'terceraClave' });
    expect(segunda.status).toBe(400);
  });
});
