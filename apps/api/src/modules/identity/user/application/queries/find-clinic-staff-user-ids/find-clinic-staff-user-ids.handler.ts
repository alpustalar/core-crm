import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindClinicStaffUserIdsQuery } from './find-clinic-staff-user-ids.query';
import {
  IUserQueryRepository,
  USER_QUERY_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user/user.query.repository';

@QueryHandler(FindClinicStaffUserIdsQuery)
export class FindClinicStaffUserIdsHandler
  implements IQueryHandler<FindClinicStaffUserIdsQuery, string[]>
{
  constructor(
    @Inject(USER_QUERY_REPOSITORY)
    private readonly userRepo: IUserQueryRepository
  ) {}

  execute(query: FindClinicStaffUserIdsQuery): Promise<string[]> {
    return this.userRepo.findActiveStaffUserIdsByClinicId(query.clinicId);
  }
}
