import { Module } from '@nestjs/common';
import { PostingPresentationModule } from './presentation/presentation.module';
import { PostingApplicationModule } from '@modules/finance/accounting/posting/application/application.module';
import { PostingInfrastructureModule } from '@modules/finance/accounting/posting/infrastructure/infrastructure.module';

@Module({
  imports: [
    PostingApplicationModule,
    PostingPresentationModule,
    PostingInfrastructureModule,
  ],
})
export class PostingModule {}
