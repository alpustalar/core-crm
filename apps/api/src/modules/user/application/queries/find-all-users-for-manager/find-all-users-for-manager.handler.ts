import { BadRequestException, Inject } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPO_TOKEN,
} from '@modules/user/domain/repositories/user.repository';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAllUsersForManagerQuery } from '@modules/user/application/queries/find-all-users-for-manager/find-all-users-for-manager.query';
import { QueryResponse } from '@shared/common/response/response.interface';
import { User } from '@shared';

@QueryHandler(FindAllUsersForManagerQuery)
export class FindAllUsersForManagerHandler
  implements IQueryHandler<FindAllUsersForManagerQuery, QueryResponse<User[]>>
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

    if (organizationIds) {
      const { total, items } = await this.userRepo.listByOrganizationIds({
        organizationId: organizationIds,
        pagination: dto,
      });

      return {
        data: items,
        meta: {
          pagination: buildPaginationMeta(dto, total),
        },
      };
    }

    if (clinicIds) {
      const { total, items } = await this.userRepo.listByClinicIds({
        clinicId: clinicIds,
        pagination: dto,
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
