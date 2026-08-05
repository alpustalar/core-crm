import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';

import { ConsentFormSubmission } from '@modules/clinical/consent-form/domain/entities/consent-form-submission.entity';
import { IConsentFormSubmissionCommandRepository } from '@modules/clinical/consent-form/domain/repositories/consent-form-submission/consent-form-submission.command.repository';

@Injectable()
export class ConsentFormSubmissionCommandRepository
  extends BaseCommandRepository<ConsentFormSubmission>
  implements IConsentFormSubmissionCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: ConsentFormSubmission): Promise<ConsentFormSubmission> {
    const raw = await this.db.consentFormSubmission.create({
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new ConsentFormSubmission(raw);
  }

  async findById(id: string): Promise<ConsentFormSubmission | null> {
    const raw = await this.db.consentFormSubmission.findUnique({
      where: { id },
    });
    return raw ? new ConsentFormSubmission(raw) : null;
  }

  /** Submission immutable — bu metod interface uyumu için var, pratikte çağrılmaz. */
  async update(entity: ConsentFormSubmission): Promise<ConsentFormSubmission> {
    const data = entity.toPersistence();
    const { id, ...update } = data;
    const raw = await this.db.consentFormSubmission.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new ConsentFormSubmission(raw);
  }
}
