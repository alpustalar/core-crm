import { Module } from '@nestjs/common';
import { AdminRequestPresentationModule } from './presentation/admin-request.presentation.module';

@Module({
  imports: [AdminRequestPresentationModule],
})
export class AdminRequestModule {}
