import { PaginationDto } from '@shared/common/pagination';

import { Inject, Injectable } from '@nestjs/common';
import {
  buildPaginationMeta,
  USER_REPO_TOKEN,
} from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IUserRepository } from '@modules/user/domain/repositories/user.repository';
import { ActorContext } from '@common/interfaces';
import { UserQueriesPrismaMapper } from '@modules/user/infrastructure/persistence/prisma/mappers/user-queries-prisma.mapper';

@Injectable()
export class FindAllUsersUseCase {
  constructor(
    @Inject(USER_REPO_TOKEN)
    private readonly userRepo: IUserRepository
  ) {}

  async execute(dto: PaginationDto, actor: ActorContext) {
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
        items,
        meta: buildPaginationMeta(dto, total),
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
        items,
        meta: buildPaginationMeta(dto, total),
      };
    }
  }
}
