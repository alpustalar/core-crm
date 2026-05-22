import { IQuery } from '@nestjs/cqrs';
import { FindUserForAuthQueryResponse } from '@modules/user/application/queries/find-user-for-auth/find-user-for-auth.response';

export class FindUserForAuthQuery implements IQuery {
  readonly __responseType!: FindUserForAuthQueryResponse;
  constructor(public readonly firebaseUid: string) {}
}
