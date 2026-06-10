import { IQuery } from '@nestjs/cqrs';
import { PartyRole } from '@prisma/client';
import { PaginationDto } from '@shared';
import { IGetContext } from '@common/decorators';
import { FindPartiesResponse } from './find-parties.response';

export class FindPartiesQuery implements IQuery {
  readonly __responseType!: FindPartiesResponse;
  constructor(
    public readonly organizationId: string,
    public readonly pagination: PaginationDto,
    public readonly ctx: IGetContext,
    public readonly role?: PartyRole
  ) {}
}
