import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IConsentFormSubmissionQueryRepository } from '@modules/clinical/consent-form/domain/repositories/consent-form.repository';
import { ConsentFormSubmission } from '@modules/clinical/consent-form/domain/entities/consent-form-submission.entity';
import {
  ConsentFormSubmissionListItem,
  FindConsentSubmissionsByPatientFilter,
} from '@modules/clinical/consent-form/domain/contracts/consent-form.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

const LIST_ITEM_SELECT = {
  id: true,
  templateId: true,
  templateTitleSnapshot: true,
  templateVersion: true,
  signedAt: true,
  signedByUserId: true,
  appointmentId: true,
  treatmentId: true,
};

@Injectable()
export class ConsentFormSubmissionQueryRepository
  extends BaseRepository
  implements IConsentFormSubmissionQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<ConsentFormSubmission | null> {
    const raw = await this.db.consentFormSubmission.findUnique({
      where: { id },
    });
    return raw ? new ConsentFormSubmission(raw) : null;
  }

  async findByPatient(
    filter: FindConsentSubmissionsByPatientFilter
  ): Promise<Paginated<ConsentFormSubmissionListItem>> {
    const result = await paginate<ConsentFormSubmissionListItem, unknown>({
      delegate: this.db.consentFormSubmission,
      pagination: filter.pagination,
      where: { patientId: filter.patientId },
      select: LIST_ITEM_SELECT,
    });
    return this.mapPagination(result);
  }
}
