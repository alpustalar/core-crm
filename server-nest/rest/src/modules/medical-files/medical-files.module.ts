import { Module } from '@nestjs/common';
import { MedicalFilesService } from './medical-files.service';
import { MedicalFilesController } from './medical-files.controller';

@Module({
  controllers: [MedicalFilesController],
  providers: [MedicalFilesService],
})
export class MedicalFilesModule {}
