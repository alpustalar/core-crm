import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RecordPayrollAccrualHandler } from './record-payroll-accrual/record-payroll-accrual.handler';

const CommandHandlers = [RecordPayrollAccrualHandler];

@Module({
  imports: [CqrsModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class PayrollCommandModule {}
