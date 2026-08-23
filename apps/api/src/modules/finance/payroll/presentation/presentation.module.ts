import { Module } from '@nestjs/common';
import { PayrollCommandController } from '@modules/finance/payroll/presentation/http/controllers/payroll.command.controller';

@Module({ controllers: [PayrollCommandController] })
export class PayrollPresentationModule {}
