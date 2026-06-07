import { CreateClinicDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateClinicInternalRelations } from '@modules/organization/clinic/domain/types/create-clinic-internal-relations.type';

export class CreateClinicCommand {
  constructor(
    public readonly dto: CreateClinicDto,
    public readonly ctx: IGetContext,
    public readonly internalRelations?: CreateClinicInternalRelations
  ) {}
}
