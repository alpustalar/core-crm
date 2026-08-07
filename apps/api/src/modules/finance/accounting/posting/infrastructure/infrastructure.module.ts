import { Module } from '@nestjs/common';
import { PostingRepositoriesModule } from '@modules/finance/accounting/posting/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [PostingRepositoriesModule];
@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class PostingInfrastructureModule {}
