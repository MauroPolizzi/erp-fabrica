import { prisma } from "../../config/database";
import { writeAuditLog } from "../../shared/middlewares/audit-log";
import { AppError } from "../../shared/utils/app-error";
import { buildMeta, type PaginationParams } from "../../shared/utils/pagination";
import { CreateEmployeesDto, UpdateEmployeesDto } from "./employees.dto";

const publicSelect = {
  id: true,
  firstName: true,
  lastName: true,
  document: true,
  position: true,
  phone: true,
  email: true,
  hireDate: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const employeesService = {
    async list(params: PaginationParams, search?: string) {
        const where = search
        ? { OR: [{ firstName: { contains: search, mode: 'insensitive' as const } }, 
            { lastName: { contains: search, mode: 'insensitive' as const } }, 
            { document: { contains: search, mode: 'insensitive' as const } }] } 
        : {};

        const [data, total] = await Promise.all([
            prisma.employee.findMany({ where, select: publicSelect, skip: params.skip, take: params.limit, orderBy: { createdAt: 'desc' } }),
            prisma.employee.count({ where }),
        ]);

        return { data, meta: buildMeta(total, params) };
    },

    async getById(id: string) {
        const employee = await prisma.employee.findUnique( {where: { id }, select: publicSelect} );
        if (!employee) throw AppError.notFound('Empleado no encontrado');
        return employee;
    },

    async create(dto: CreateEmployeesDto, actorId?: string) {
        const exists = await prisma.employee.findUnique({ where: { document: dto.document } });
        if (exists) throw AppError.conflict('El documento ya fue registrado');

        const employee = await prisma.employee.create({
            data: { firstName: dto.firstName, lastName: dto.lastName, document: dto.document, position: dto.position, 
                phone: dto.phone, email: dto.email, hireDate: dto.hireDate 
            },
            select: publicSelect,
        });
        await writeAuditLog({ userId: actorId, action: 'CREATE', entity: 'Employee', entityId: employee.id, newValues: employee });
        return employee;
    },

    async update(id: string, dto: UpdateEmployeesDto, actorId?: string) {
        const before = await this.getById(id);

        // Si se cambia el documento, validar que no colisione con otro empleado.
        if (dto.document && dto.document !== before.document) {
            const exists = await prisma.employee.findUnique({ where: { document: dto.document } });
            if (exists) throw AppError.conflict('El documento ya fue registrado');
        }

        const employees = await prisma.employee.update({ where: { id }, data: dto, select: publicSelect });
        await writeAuditLog({ userId: actorId, action: 'UPDATE', entity: 'Employee', entityId: id, oldValues: before, newValues: employees });
        return employees;
    },

    async deactivate(id: string, actorId?: string) {
        const before = await this.getById(id);
        const employees = await prisma.employee.update({ where: { id }, data: { isActive: false }, select: publicSelect });
        await writeAuditLog({ userId: actorId, action: 'DELETE', entity: 'Employee', entityId: id, oldValues: before, newValues: employees });
        return employees;
    },
}