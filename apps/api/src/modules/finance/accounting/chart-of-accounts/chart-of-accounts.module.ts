import { Module } from '@nestjs/common';
import { ChartOfAccountsPresentationModule } from './presentation/presentation.module';

@Module({
  imports: [ChartOfAccountsPresentationModule],
})
export class ChartOfAccountsModule {}
