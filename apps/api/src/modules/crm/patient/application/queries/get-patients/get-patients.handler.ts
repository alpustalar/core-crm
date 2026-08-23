import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPatientsQuery } from './get-patients.query';
import { GetPatientsResponse } from './get-patients.response';
import {
  IPatientQueryRepository,
  PATIENT_QUERY_REPOSITORY,
} from '@modules/crm/patient/domain/repositories/patient/patient.query.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import { PatientAccessDeniedException } from '@modules/crm/patient/domain/exceptions/patient.exceptions';

/**
 * Hasta listesi. Kapsam **aktörün organizasyonu** — filtreden gelen bir
 * organizationId'ye güvenilmez, aksi halde başka bir kiracının hasta listesi
 * sorgu parametresiyle okunabilirdi. Klinik daraltması isteğe bağlıdır ve
 * aktörün erişebildiği kliniklerle sınırlıdır (policy).
 */
@QueryHandler(GetPatientsQuery)
export class GetPatientsHandler
  implements IQueryHandler<GetPatientsQuery, GetPatientsResponse>
{
  constructor(
    @Inject(PATIENT_QUERY_REPOSITORY)
    private readonly patientQueryRepo: IPatientQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: GetPatientsQuery): Promise<GetPatientsResponse> {
    const { filter, pagination, ctx } = query.payload;

    const organizationId = ctx.actor.organizationId;
    if (!organizationId) throw new PatientAccessDeniedException();

    const { policy } = this.policyFactory.patient(ctx.actor, ctx.source);

    const scope = { organizationId, clinicId: filter.clinicId ?? null };
    if (!policy.canAccessPatient(scope)) {
      throw new PatientAccessDeniedException();
    }

    const result = await this.patientQueryRepo.findMany(
      {
        organizationId,
        clinicId: filter.clinicId,
        status: filter.status,
        search: filter.search,
      },
      pagination
    );

    return {
      data: result.items,
      meta: {
        pagination: buildPaginationMeta(pagination, result.total),
        serializationOptions: policy.getSerializationOptions(scope),
      },
    };
  }
}
