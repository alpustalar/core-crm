import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClinicAiAgentConfig as IClinicAiAgentConfig } from '@shared';
import { MongoBaseRepository } from '@src/infrastructure/persistence/mongo/mongo-base.repository';
import { IClinicAiAgentConfigCommandRepository } from '@modules/ai-agent/domain/repositories/clinic-ai-agent-config.repository';
import { ClinicAiAgentConfig } from '@modules/ai-agent/domain/entities/clinic-ai-agent-config.entity';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';
import {
  ClinicAiAgentConfigDocument,
  ClinicAiAgentConfigModel,
} from '../../schemas/clinic-ai-agent-config.schema';

@Injectable()
export class ClinicAiAgentConfigCommandRepository
  extends MongoBaseRepository
  implements IClinicAiAgentConfigCommandRepository
{
  constructor(
    @InjectModel(ClinicAiAgentConfigModel.name, MESSAGING_MONGO_CONNECTION)
    private readonly model: Model<ClinicAiAgentConfigDocument>
  ) {
    super();
  }

  async findByClinicId(clinicId: string): Promise<ClinicAiAgentConfig | null> {
    const doc = await this.model
      .findOne({ clinicId })
      .session(this.session)
      .lean()
      .exec();
    return doc
      ? new ClinicAiAgentConfig(this.toPlain<IClinicAiAgentConfig>(doc))
      : null;
  }

  /** 1:1 satellite (clinicId unique) → get-or-create (upsert). */
  async upsertByClinicId(
    entity: ClinicAiAgentConfig
  ): Promise<ClinicAiAgentConfig> {
    const { id, ...data } = entity.toPersistence();

    const doc = await this.model
      .findOneAndUpdate(
        { clinicId: data.clinicId },
        {
          $set: {
            isEnabled: data.isEnabled,
            // NOT: Prisma implementasyonu `provider`'ı update listesine almıyordu;
            // entity değişime izin verdiği için (updateSettings → _provider) klinik
            // Claude↔Gemini geçişi bellekte oluyor ama diske yazılmıyordu. Burada
            // yazılıyor — sağlayıcı seçimi kalıcı hale geldi.
            provider: data.provider,
            model: data.model,
            systemPrompt: data.systemPrompt,
            apiKey: data.apiKey,
            maxTokens: data.maxTokens,
            replyOnlyWithinWindow: data.replyOnlyWithinWindow,
            businessHours: data.businessHours,
            updatedAt: data.updatedAt,
          },
          $setOnInsert: {
            _id: id,
            organizationId: data.organizationId,
            createdAt: data.createdAt,
          },
        },
        { new: true, upsert: true }
      )
      .session(this.session)
      .lean()
      .exec();

    entity.flushEvents();
    return new ClinicAiAgentConfig(this.toPlain<IClinicAiAgentConfig>(doc));
  }
}
