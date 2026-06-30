import { IGetContext } from '@common/decorators/get-context.decorator';
import { IQuery } from '@nestjs/cqrs';
import { FindPatientByFirebaseUidQueryResponse } from '@modules/crm/patient/application/queries/find-patient-by-firebase-uid/find-patient-by-firebase-uid.response';

export class FindPatientByFirebaseUidQuery implements IQuery {
  public readonly __responseType!: FindPatientByFirebaseUidQueryResponse;

  constructor(
    public readonly patientFirebaseUid: string,
    public readonly ctx: IGetContext
  ) {}
}
