import { Module } from '@nestjs/common';
import { RecordPayrollAccrualHandler } from './record-payroll-accrual/record-payroll-accrual.handler';

const CommandHandlers = [RecordPayrollAccrualHandler];

@Module({
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class PayrollCommandModule {}
