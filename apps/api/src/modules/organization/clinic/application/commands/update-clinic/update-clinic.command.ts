import { UpdateClinic } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class UpdateClinicCommand {
  constructor(
    public readonly payload: {
      clinicId: string;
      data: UpdateClinic;
      ctx: IGetContext;
    }
  ) {}
}
