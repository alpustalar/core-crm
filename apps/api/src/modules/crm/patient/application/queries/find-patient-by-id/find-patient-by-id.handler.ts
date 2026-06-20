import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindPatientByIdQuery } from './find-patient-by-id.query';
import {
  IPatientQueryRepository,
  PATIENT_QUERY_REPOSITORY,
} from '@modules/crm/patient/domain/repositories/patient.repository.interface';
import { Inject, NotFoundException } from '@nestjs/common';
import { FindPatientByIdQueryResponse } from '@modules/crm/patient/application/queries/find-patient-by-id/find-patient-by-id.response';

@QueryHandler(FindPatientByIdQuery)
export class FindPatientByIdHandler
  implements IQueryHandler<FindPatientByIdQuery, FindPatientByIdQueryResponse>
{
  constructor(
    @Inject(PATIENT_QUERY_REPOSITORY)
    private readonly patientQueryRepository: IPatientQueryRepository
  ) {}

  async execute(
    query: FindPatientByIdQuery
  ): Promise<FindPatientByIdQueryResponse> {
    const { patientId } = query;
    const patient = await this.patientQueryRepository.find(patientId);

    if (!patient) {
      throw new NotFoundException('Misafir bulunamadı');
    }
    return {
      data: patient,
    };
  }
}
