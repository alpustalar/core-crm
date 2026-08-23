import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { Pagination } from '@shared/common';
import type { GetPatients } from '@shared/modules/patients/types/queries';
import { GetPatientsResponse } from './get-patients.response';

export class GetPatientsQuery implements IQuery {
  readonly __responseType!: GetPatientsResponse;

  constructor(
    public readonly payload: {
      readonly filter: GetPatients;
      readonly pagination: Pagination;
      readonly ctx: IGetContext;
    }
  ) {}
}
