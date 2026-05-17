import { CreateClinicDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class CreateClinicCommand {
  constructor(
    public readonly dto: CreateClinicDto,
    public readonly context: IGetContext
  ) {}
}
