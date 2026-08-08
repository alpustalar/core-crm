import { Module } from '@nestjs/common';
import { EmployeePresentationModule } from './presentation/presentation.module';

@Module({ imports: [EmployeePresentationModule] })
export class EmployeeModule {}
