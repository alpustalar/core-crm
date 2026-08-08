import { Module } from '@nestjs/common';
import {
  LeaveRepositoriesModule
} from '@modules/hr/leave/infrastructure/persistence/prisma/repositories/repositories.module';

const LeaveInfrastructureModules = [LeaveRepositoriesModule];

@Module({
  imports: [...LeaveInfrastructureModules],
  exports: [...LeaveInfrastructureModules]
})
export class LeaveInfrastructureModule {}