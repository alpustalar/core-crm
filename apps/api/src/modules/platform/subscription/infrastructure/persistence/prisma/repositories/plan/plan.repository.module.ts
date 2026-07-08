import { Module } from '@nestjs/common';
import {
  PLAN_COMMAND_REPOSITORY,
  PLAN_QUERY_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/plan.repository.interface';
import { PlanCommandRepository } from './plan.command.repository';
import { PlanQueryRepository } from './plan.query.repository';

@Module({
  providers: [
    { provide: PLAN_COMMAND_REPOSITORY, useClass: PlanCommandRepository },
    { provide: PLAN_QUERY_REPOSITORY, useClass: PlanQueryRepository },
  ],
  exports: [PLAN_COMMAND_REPOSITORY, PLAN_QUERY_REPOSITORY],
})
export class PlanRepositoryModule {}
