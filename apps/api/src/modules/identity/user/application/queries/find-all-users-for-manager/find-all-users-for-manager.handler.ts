import { BadRequestException, Inject } from '@nestjs/common';
import {
  IUserQueryRepository,
  USER_QUERY_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user.repository';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAllUsersForManagerQuery } from '@modules/identity/user/application/queries/find-all-users-for-manager/find-all-users-for-manager.query';
import { FindAllUsersForManagerQueryResponse } from '@modules/identity/user/application/queries/find-all-users-for-manager/find-all-users-for-manager.response';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { SerializationOptions } from '@shared';
import { UserResponseGroups } from '@modules/identity/user/domain/contracts/user.contracts';

const { ADMIN, MANAGEMENT } = UserResponseGroups;

@QueryHandler(FindAllUsersForManagerQuery)
export class FindAllUsersForManagerHandler
  implements
    IQueryHandler<
      FindAllUsersForManagerQuery,
      FindAllUsersForManagerQueryResponse
    >
{
  constructor(
    @Inject(USER_QUERY_REPOSITORY)
    private readonly userRepo: IUserQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: FindAllUsersForManagerQuery
  ): Promise<FindAllUsersForManagerQueryResponse> {
    const { dto, ctx } = query;

    const { actor, source } = ctx;
    let clinicIds: string[] | undefined;
    let organizationIds: string[] | undefined;

    const user = this.policyFactory.user(actor, source).policy;

    const groups = [MANAGEMENT, user.isSystemAdmin() && ADMIN].filter(
      (group) => typeof group === 'string'
    );

    const serializationOptions: SerializationOptions = {
      isGroupActive: true,
      groups,
    };

    if (actor.managedClinics) {
      clinicIds = actor.managedClinics.map((clinic) => clinic.id);
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
        data: items.map((user) => user.toPersistence()),
        meta: {
          pagination: buildPaginationMeta(dto, total),
          serializationOptions,
        },
      };
    }

    if (clinicIds) {
      const { total, items } = await this.userRepo.listByClinicIds({
        clinicId: clinicIds,
        pagination: dto,
      });

      return {
        data: items.map((user) => user.toPersistence()),
        meta: {
          pagination: buildPaginationMeta(dto, total),
          serializationOptions,
        },
      };
    }

    throw new BadRequestException(
      'Kullanıcı organizasyon sahibi ya da klinik menajeri olmalı'
    );
  }
}
