import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicAiAgentConfigQueryRepository } from '@modules/messaging/ai-agent/domain/repositories/clinic-ai-agent-config.repository';
import { ClinicAiAgentConfig as IClinicAiAgentConfig } from '@shared';

@Injectable()
export class ClinicAiAgentConfigQueryRepository
  extends BaseRepository
  implements IClinicAiAgentConfigQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByClinicId(clinicId: string): Promise<IClinicAiAgentConfig | null> {
    return this.db.clinicAiAgentConfig.findUnique({
      where: { clinicId },
    });
  }
}
