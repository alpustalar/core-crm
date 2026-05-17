import { UpdateClinicDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class UpdateClinicCommand {
  constructor(
    public readonly clinicId: string,
    public readonly dto: UpdateClinicDto,
    public readonly context: IGetContext
  ) {}
}
