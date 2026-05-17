import { IGetContext } from '@common/decorators/get-context.decorator';

export class FindPatientByIdQuery {
  constructor(
    public readonly patientId: string,
    public readonly context: IGetContext
  ) {}
}
