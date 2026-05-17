import { IGetContext } from '@common/decorators/get-context.decorator';
import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { FindPatientByIdQuery } from '@modules/patient/application/queries/find-patient-by-id/find-patient-by-id.query';
import { QueryResponse } from '@shared/common/response/response.interface';
import { Patient } from '@shared';

@Injectable()
export class PatientModuleApi {
  constructor(private readonly queryBus: QueryBus) {}

  findPatientById(
    id: string,
    context: IGetContext
  ): Promise<QueryResponse<Patient>> {
    return this.queryBus.execute(new FindPatientByIdQuery(id, context));
  }
}
