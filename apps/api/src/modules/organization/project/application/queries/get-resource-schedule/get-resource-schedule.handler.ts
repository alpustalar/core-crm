import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  IProjectResourceAllocationQueryRepository,
  PROJECT_RESOURCE_ALLOCATION_QUERY_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project-resource-allocation/project-resource-allocation.query.repository';
import { GetResourceScheduleQuery } from './get-resource-schedule.query';
import { GetResourceScheduleResponse } from './get-resource-schedule.response';

/**
 * Kaynak takvimi: verilen aralıkta hangi personel/oda/cihaz hangi projeye ne
 * kadar ayrılmış. Tahsis öncesi "kim müsait" sorusunun cevabı.
 */
@QueryHandler(GetResourceScheduleQuery)
export class GetResourceScheduleHandler implements IQueryHandler<
  GetResourceScheduleQuery,
  GetResourceScheduleResponse
> {
  constructor(
    @Inject(PROJECT_RESOURCE_ALLOCATION_QUERY_REPOSITORY)
    private readonly allocationQueryRepo: IProjectResourceAllocationQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetResourceScheduleQuery
  ): Promise<GetResourceScheduleResponse> {
    const { filter, ctx } = query.payload;
    const clinicId = ctx.actor.clinicId ?? '';

    const { evaluator, policy } = this.policyFactory.project(
      ctx.actor,
      ctx.source
    );

    evaluator
      .check((p) => p.canAccessClinicProjects(clinicId))
      .orThrow('project-resource.schedule');

    const rows = await this.allocationQueryRepo.findSchedule({
      clinicId,
      kind: filter.kind,
      resourceId: filter.resourceId,
      from: filter.from,
      to: filter.to,
    });

    return {
      data: rows,
      meta: {
        serializationOptions: policy.getSerializationOptions({ clinicId }),
      },
    };
  }
}
