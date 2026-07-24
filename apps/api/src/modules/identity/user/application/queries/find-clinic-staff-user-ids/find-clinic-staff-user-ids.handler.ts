import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindClinicStaffUserIdsQuery } from './find-clinic-staff-user-ids.query';
import {
  IUserQueryRepository,
  USER_QUERY_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user.repository';

@QueryHandler(FindClinicStaffUserIdsQuery)
export class FindClinicStaffUserIdsHandler
  implements IQueryHandler<FindClinicStaffUserIdsQuery, string[]>
{
  constructor(
    @Inject(USER_QUERY_REPOSITORY)
    private readonly userQueryRepo: IUserQueryRepository
  ) {}

  execute(query: FindClinicStaffUserIdsQuery): Promise<string[]> {
    return this.userQueryRepo.findActiveStaffUserIdsByClinicId(query.clinicId);
  }
}
