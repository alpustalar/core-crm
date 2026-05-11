import { BadRequestException, Inject } from '@nestjs/common';
import {
  IUser,
  IUserRepository,
  USER_REPO_TOKEN,
} from '@modules/user/domain/repositories/user.repository';
import { UserQueriesPrismaMapper } from '@modules/user/infrastructure/persistence/prisma/mappers/user-queries-prisma.mapper';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAllUsersForManagerQuery } from '@modules/user/application/queries/find-all-users-for-manager/find-all-users-for-manager.query';
import { QueryResult } from '@shared/common/response/response.interface';

@QueryHandler(FindAllUsersForManagerQuery)
export class FindAllUsersForManagerHandler
  implements IQueryHandler<FindAllUsersForManagerQuery, QueryResult<IUser[]>>
{
  constructor(
    @Inject(USER_REPO_TOKEN)
    private readonly userRepo: IUserRepository
  ) {}

  async execute(query: FindAllUsersForManagerQuery) {
    const { dto, context } = query;

    const { actor } = context;
    let clinicIds: string | string[] | undefined;
    let organizationIds: string | string[] | undefined;

    if (actor.managedClinics) {
      clinicIds = actor.managedClinics.map((clinic) => clinic.id);
    } else {
      clinicIds = actor.clinicId;
    }

    if (actor.ownedOrganizations) {
      organizationIds = actor.ownedOrganizations.map((org) => org.id);
    }

    const extraWhere = UserQueriesPrismaMapper.findUsersWhere();

    const select = UserQueriesPrismaMapper.findUsersSelect();

    if (organizationIds) {
      const { total, items } = await this.userRepo.findUsersByOrganizationIds({
        organizationId: organizationIds,
        pagination: dto,
        extraWhere,
        select,
      });

      return {
        data: items,
        meta: {
          pagination: buildPaginationMeta(dto, total),
        },
      };
    }

    if (clinicIds) {
      const { total, items } = await this.userRepo.findUsersByClinicIds({
        clinicId: clinicIds,
        pagination: dto,
        extraWhere,
        select,
      });

      return {
        data: items,
        meta: {
          pagination: buildPaginationMeta(dto, total),
        },
      };
    }

    throw new BadRequestException(
      'Kullanıcı organizasyon sahibi ya da klinik menajeri olmalı'
    );
  }
}
