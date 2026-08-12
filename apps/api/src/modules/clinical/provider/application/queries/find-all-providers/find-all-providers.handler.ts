import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { FindAllProvidersQuery } from './find-all-providers.query';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import { FindAllProvidersQueryResponse } from '@modules/clinical/provider/application/queries/find-all-providers/find-all-providers.response';
import { ClinicNotAssignedException } from '@src/domain/exceptions/clinic-not-assigned.exception';
import {
  IProviderQueryRepository,
  PROVIDER_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider/provider.query.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(FindAllProvidersQuery)
export class FindAllProvidersHandler
  implements
    IQueryHandler<FindAllProvidersQuery, FindAllProvidersQueryResponse>
{
  constructor(
    @Inject(PROVIDER_QUERY_REPOSITORY)
    private readonly providerRepo: IProviderQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: FindAllProvidersQuery
  ): Promise<FindAllProvidersQueryResponse> {
    const {
      ctx: { actor, source },
      pagination,
    } = query;

    if (actor.ownedOrganizations?.length) {
      const organizationIds = actor.ownedOrganizations.map((org) => org.id);
      const { items, total } = await this.providerRepo.findManyByOrganizationId(
        pagination,
        organizationIds
      );
      return {
        data: items,
        meta: {
          pagination: buildPaginationMeta(pagination, total),
          serializationOptions: this.policyFactory
            .organization(actor, source)
            .policy.getSerializationOptions(),
        },
      };
    }

    if (actor.managedClinics?.length) {
      const clinicIds = actor.managedClinics.map((clinic) => clinic.id);
      const results = await Promise.all(
        clinicIds.map((id) =>
          this.providerRepo.findManyByClinicIds(
            { ...pagination, page: 1, limit: 999999 },
            id
          )
        )
      );

      const allItems = results.flatMap((result) => result.items);
      const total = allItems.length;
      const start = (pagination.page - 1) * pagination.limit;
      const paginatedItems = allItems.slice(start, start + pagination.limit);

      return {
        data: paginatedItems,
        meta: {
          pagination: buildPaginationMeta(pagination, total),
          // Tüm satırlar aktörün yönettiği kliniklerden geliyor; yönetim grupları
          // liste genelinde tekdüze geçerli — temsilci klinik üzerinden çözülür.
          serializationOptions: this.policyFactory
            .clinic(actor, source)
            .policy.getSerializationOptions({ clinicId: clinicIds[0] }),
        },
      };
    }

    if (!actor.clinicId) {
      throw new ClinicNotAssignedException();
    }

    const { items, total } = await this.providerRepo.findManyByClinicIds(
      pagination,
      actor.clinicId
    );
    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(pagination, total),
        serializationOptions: this.policyFactory
          .clinic(actor, source)
          .policy.getSerializationOptions({ clinicId: actor.clinicId }),
      },
    };
  }
}
