import { Inject, Injectable } from '@nestjs/common';
import { slugIt } from '@common/utils';
import { ClinicEventPublisher } from '../../../../infrastructure/events/publisher/clinic.event-publisher';
import { ActorContext } from '@common/interfaces';
import { PolicyFactory } from '@modules/policy/application/policy-factory';
import { CreateClinicDto } from '@shared';
import { AuditLogService } from '@modules/audit-log/audit-log.service';
import { GlobalStatus } from '@prisma/client';
import {
  CLINIC_REPO_TOKEN,
  IClinicRepository,
} from '@modules/clinic/domain/repositories/clinic.repository.interface';

@Injectable()
export class CreateClinicUseCase {
  constructor(
    @Inject(CLINIC_REPO_TOKEN)
    private readonly clinicRepo: IClinicRepository,
    private readonly clinicEventPublisher: ClinicEventPublisher,
    private readonly policyFactory: PolicyFactory,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(dto: CreateClinicDto, actor: ActorContext) {
    const { name, organizationId, sectorId, status, ...restDto } = dto;
    const slug = slugIt(name);

    const { evaluator } = this.policyFactory.organization(actor);

    if (organizationId) {
      evaluator
        .check((p) => p.isOwnOrganization(organizationId), 'Yetki ihlali')
        .orThrow();
      // TODO: event fırlat
    }

    const clinic = await this.clinicRepo.create({
      name,
      slug: slugIt(slug ?? name),
      organizationId,
      sectorId,
      status: status ?? GlobalStatus.TRIAL,
      logo: null,
      ...restDto,
    });

    this.clinicEventPublisher.createClinic({
      clinicId: clinic.id,
      userId: actor.userId,
      organizationId: clinic?.organizationId ?? undefined,
      source: actor?.source,
    });

    return clinic;
  }
}
