import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicAiAgentConfigQueryRepository } from '@modules/messaging/ai-agent/domain/repositories/clinic-ai-agent-config.repository';
import { ClinicAiAgentConfig } from '@modules/messaging/ai-agent/domain/entities/clinic-ai-agent-config.entity';

@Injectable()
export class ClinicAiAgentConfigQueryRepository
  extends BaseRepository
  implements IClinicAiAgentConfigQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByClinicId(clinicId: string): Promise<ClinicAiAgentConfig | null> {
    const raw = await this.db.clinicAiAgentConfig.findUnique({
      where: { clinicId },
    });
    return raw ? new ClinicAiAgentConfig(raw) : null;
  }
}
