import { IQuery } from '@nestjs/cqrs';
import { PaginationDto } from '@shared';
import { IGetContext } from '@common/decorators';
import { FindPartiesResponse } from './find-parties.response';
import { PartyRoleType } from '@input-type-schemas/PartyRoleSchema';

export class FindPartiesQuery implements IQuery {
  readonly __responseType!: FindPartiesResponse;
  constructor(
    public readonly clinicId: string,
    public readonly pagination: PaginationDto,
    public readonly ctx: IGetContext,
    public readonly role?: PartyRoleType
  ) {}
}
