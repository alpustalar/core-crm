import { CreateClinic } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateClinicInternalRelations } from '@modules/organization/clinic/domain/contracts/clinic.contracts';

export class CreateClinicCommand {
  constructor(
    public readonly payload: {
      data: CreateClinic;
      ctx: IGetContext;
      internalRelations?: CreateClinicInternalRelations;
    }
  ) {}
}
