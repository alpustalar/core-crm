import { Module } from '@nestjs/common';
import { LeaveRepositoryModule } from '@modules/hr/leave/infrastructure/persistence/prisma/repositories/leave/leave.repository.module';

const LeaveRepositoriesModules = [LeaveRepositoryModule];

@Module({
  imports: [...LeaveRepositoriesModules],
  exports: [...LeaveRepositoriesModules],
})
export class LeaveRepositoriesModule {}
