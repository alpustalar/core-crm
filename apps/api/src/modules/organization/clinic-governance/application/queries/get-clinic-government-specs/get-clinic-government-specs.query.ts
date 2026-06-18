import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetClinicGovernmentSpecsResponse } from './get-clinic-government-specs.response';

/** Bir kliniğin devlet/regülasyon kimliğini döner; yoksa null. */
export class GetClinicGovernmentSpecsQuery implements IQuery {
  readonly __responseType!: GetClinicGovernmentSpecsResponse;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
