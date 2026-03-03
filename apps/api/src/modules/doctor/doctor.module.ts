import { Module } from '@nestjs/common';
import { DoctorControllers } from '@modules/doctor/controllers';

@Module({
  controllers: [...DoctorControllers],
  providers: [],
})
export class DoctorModule {}
