import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicAiAgentConfigCommandRepository } from '@modules/messaging/ai-agent/domain/repositories/clinic-ai-agent-config.repository';
import { ClinicAiAgentConfig } from '@modules/messaging/ai-agent/domain/entities/clinic-ai-agent-config.entity';

@Injectable()
export class ClinicAiAgentConfigCommandRepository
  extends BaseRepository
  implements IClinicAiAgentConfigCommandRepository
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

  // 1:1 satellite (clinicId unique) → get-or-create (upsert).
  async upsertByClinicId(
    entity: ClinicAiAgentConfig
  ): Promise<ClinicAiAgentConfig> {
    const data = entity.toPersistence();
    // Prisma nullable Json: JS null yerine Prisma.JsonNull beklenir.
    const businessHours =
      data.businessHours === null
        ? Prisma.JsonNull
        : (data.businessHours as Prisma.InputJsonValue);

    const raw = await this.db.clinicAiAgentConfig.upsert({
      where: { clinicId: data.clinicId },
      create: { ...data, businessHours },
      update: {
        isEnabled: data.isEnabled,
        model: data.model,
        systemPrompt: data.systemPrompt,
        apiKey: data.apiKey,
        maxTokens: data.maxTokens,
        replyOnlyWithinWindow: data.replyOnlyWithinWindow,
        businessHours,
      },
    });
    entity.flushEvents();
    return new ClinicAiAgentConfig(raw);
  }
}
