import { Module } from '@nestjs/common';
import { PayrollController } from './controllers/payroll.controller';
import { PayrollCommandModule } from '@modules/finance/payroll/application/commands/command.module';

@Module({
  imports: [PayrollCommandModule],
  controllers: [PayrollController],
})
export class PayrollPresentationModule {}
