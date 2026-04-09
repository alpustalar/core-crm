import { Module } from '@nestjs/common';
import { DoctorControllers } from '@modules/doctor/presentation/controllers';

@Module({
  controllers: [...DoctorControllers],
  providers: [],
})
export class DoctorModule {}
