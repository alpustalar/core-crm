import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IEmployeeContractCommandRepository } from '@modules/hr/employee/domain/repositories/employee.repository';
import { EmployeeContract } from '@modules/hr/employee/domain/entities/employee-contract.entity';

@Injectable()
export class EmployeeContractCommandRepository
  extends BaseCommandRepository<EmployeeContract>
  implements IEmployeeContractCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: EmployeeContract): Promise<EmployeeContract> {
    const raw = await this.db.employeeContract.create({
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new EmployeeContract(raw);
  }

  async findById(id: string): Promise<EmployeeContract | null> {
    const raw = await this.db.employeeContract.findUnique({ where: { id } });
    return raw ? new EmployeeContract(raw) : null;
  }

  async save(entity: EmployeeContract): Promise<EmployeeContract> {
    const data = entity.toPersistence();
    const { id, ...update } = data;
    const raw = await this.db.employeeContract.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new EmployeeContract(raw);
  }

  async findActiveByEmployeeId(
    employeeId: string
  ): Promise<EmployeeContract | null> {
    const raw = await this.db.employeeContract.findFirst({
      where: { employeeId, isActive: true },
      orderBy: { startDate: 'desc' },
    });
    return raw ? new EmployeeContract(raw) : null;
  }
}
