import { IQuery } from '@nestjs/cqrs';
import { GetRoleByIdQueryResponse } from './get-role-by-id.response';

export class GetRoleByIdQuery implements IQuery {
  readonly __responseType!: GetRoleByIdQueryResponse;

  constructor(public readonly roleId: string) {}
}
