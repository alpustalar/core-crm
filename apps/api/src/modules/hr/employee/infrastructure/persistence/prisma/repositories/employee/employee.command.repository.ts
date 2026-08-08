import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { Employee } from '@modules/hr/employee/domain/entities/employee.entity';
import { IEmployeeCommandRepository } from '@modules/hr/employee/domain/repositories/employee/employee.command.repository';

@Injectable()
export class EmployeeCommandRepository
  extends BaseCommandRepository<Employee>
  implements IEmployeeCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: Employee): Promise<Employee> {
    const raw = await this.db.employee.create({ data: entity.toPersistence() });
    entity.flushEvents();
    return new Employee(raw);
  }

  async findById(id: string): Promise<Employee | null> {
    const raw = await this.db.employee.findUnique({ where: { id } });
    return raw ? new Employee(raw) : null;
  }

  async update(entity: Employee): Promise<Employee> {
    const data = entity.toPersistence();
    const { id, ...update } = data;
    const raw = await this.db.employee.update({ where: { id }, data: update });
    entity.flushEvents();
    return new Employee(raw);
  }
}
