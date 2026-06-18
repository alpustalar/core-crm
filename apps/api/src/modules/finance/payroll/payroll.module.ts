import { Module } from '@nestjs/common';
import { PayrollCommandModule } from './application/commands/command.module';
import { PayrollPresentationModule } from './presentation/payroll-presentation.module';

@Module({
  imports: [PayrollCommandModule, PayrollPresentationModule],
  exports: [PayrollCommandModule],
})
export class PayrollModule {}
