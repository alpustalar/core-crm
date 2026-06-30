import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicIyzicoTerminalConfigCommandRepository } from '@modules/finance/pos/physical/domain/repositories/clinic-iyzico-terminal-config.repository';
import { ClinicIyzicoTerminalConfig } from '@modules/finance/pos/physical/domain/entities/clinic-iyzico-terminal-config.entity';

@Injectable()
export class ClinicIyzicoTerminalConfigCommandRepository
  extends BaseRepository
  implements IClinicIyzicoTerminalConfigCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(
    entity: ClinicIyzicoTerminalConfig
  ): Promise<ClinicIyzicoTerminalConfig> {
    const data = entity.toPersistence();
    const raw = await this.db.clinicIyzicoTerminalConfig.upsert({
      where: { clinicId: data.clinicId },
      create: data,
      update: {
        clientId: data.clientId,
        clientSecret: data.clientSecret,
        username: data.username,
        password: data.password,
      },
    });
    entity.flushEvents();
    return new ClinicIyzicoTerminalConfig(raw);
  }
}
