import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetClinicHealthTourismConfigResponse } from './get-clinic-health-tourism-config.response';

/** Bir kliniğin sağlık-turizmi config'ini döner; yoksa null. */
export class GetClinicHealthTourismConfigQuery implements IQuery {
  readonly __responseType!: GetClinicHealthTourismConfigResponse;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
