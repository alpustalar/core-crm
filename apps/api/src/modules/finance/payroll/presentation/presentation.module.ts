import { Module } from '@nestjs/common';
import { PayrollController } from '@modules/finance/payroll/presentation/http/controllers/payroll.controller';

@Module({ controllers: [PayrollController] })
export class PayrollPresentationModule {}
