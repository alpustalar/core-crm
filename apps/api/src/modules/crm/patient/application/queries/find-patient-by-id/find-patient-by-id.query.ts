import { IGetContext } from '@common/decorators/get-context.decorator';
import { IQuery } from '@nestjs/cqrs';
import { FindPatientByIdQueryResponse } from '@modules/crm/patient/application/queries/find-patient-by-id/find-patient-by-id.response';

export class FindPatientByIdQuery implements IQuery {
  public readonly __responseType!: FindPatientByIdQueryResponse;

  constructor(
    public readonly patientId: string,
    public readonly ctx: IGetContext
  ) {}
}
