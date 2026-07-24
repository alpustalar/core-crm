import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IEmployeeQueryRepository } from '@modules/hr/employee/domain/repositories/employee.repository';
import { Employee } from '@modules/hr/employee/domain/entities/employee.entity';
import {
  EmployeeWithContracts,
  FindEmployeesFilter,
} from '@modules/hr/employee/domain/contracts/employee.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

type EmployeeRow = Prisma.EmployeeGetPayload<{ include: { contracts: true } }>;

@Injectable()
export class EmployeeQueryRepository
  extends BaseRepository
  implements IEmployeeQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<EmployeeWithContracts | null> {
    const row = await this.db.employee.findFirst({
      where: { id, isDeleted: false },
      include: { contracts: { orderBy: { startDate: 'desc' } } },
    });
    return row ? this.toView(row) : null;
  }

  async findByClinic(filter: FindEmployeesFilter): Promise<Paginated<Employee>> {
    const where: Record<string, unknown> = {
      clinicId: filter.clinicId,
      isDeleted: false,
    };
    if (filter.status) where.status = filter.status;

    const result = await paginate({
      delegate: this.db.employee,
      pagination: filter.pagination,
      where,
    });
    return this.mapPagination(result, (r) => new Employee(r));
  }

  private toView(row: EmployeeRow): EmployeeWithContracts {
    const { contracts, ...employee } = row;
    return {
      ...employee,
      contracts: contracts.map((c) => ({
        id: c.id,
        type: c.type,
        startDate: c.startDate,
        endDate: c.endDate,
        grossSalary: c.grossSalary.toFixed(2),
        currency: c.currency,
        isActive: c.isActive,
      })),
    };
  }
}
