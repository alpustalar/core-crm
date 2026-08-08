import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClinicAiAgentConfig as IClinicAiAgentConfig } from '@shared';
import { MongoBaseRepository } from '@src/infrastructure/persistence/mongo/mongo-base.repository';
import { IClinicAiAgentConfigQueryRepository } from '@modules/ai-agent/domain/repositories/clinic-ai-agent-config.repository';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';
import {
  ClinicAiAgentConfigDocument,
  ClinicAiAgentConfigModel,
} from '../../schemas/clinic-ai-agent-config.schema';

@Injectable()
export class ClinicAiAgentConfigQueryRepository
  extends MongoBaseRepository
  implements IClinicAiAgentConfigQueryRepository
{
  constructor(
    @InjectModel(ClinicAiAgentConfigModel.name, MESSAGING_MONGO_CONNECTION)
    private readonly model: Model<ClinicAiAgentConfigDocument>
  ) {
    super();
  }

  async findByClinicId(clinicId: string): Promise<IClinicAiAgentConfig | null> {
    const doc = await this.model.findOne({ clinicId }).lean().exec();
    return doc ? this.toPlain<IClinicAiAgentConfig>(doc) : null;
  }
}
