import { IQuery } from '@nestjs/cqrs';
import { CheckEmailExistsQueryResponse } from '@modules/identity/user/application/queries/check-email-exists/check-email-exists.response';

export class CheckEmailExistsQuery implements IQuery {
  readonly __responseType!: CheckEmailExistsQueryResponse;
  constructor(public readonly email: string) {}
}
