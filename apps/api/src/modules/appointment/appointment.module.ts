import { Module } from '@nestjs/common';
import { UserUseCaseModule } from '@modules/user/application/use-cases/module';

const UseCases = [];
@Module({
  imports: [UserUseCaseModule],
  controllers: [],
  providers: [...UseCases],
  exports: [...UseCases],
})
export class AppointmentModule {}
