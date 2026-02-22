import { Injectable } from '@nestjs/common';
import { CreateMedicalFileDto } from './dto/create-medical-file.dto';
import { UpdateMedicalFileDto } from './dto/update-medical-file.dto';

@Injectable()
export class MedicalFilesService {
  create(createMedicalFileDto: CreateMedicalFileDto) {
    return 'This action adds a new medicalFile';
  }

  findAll() {
    return `This action returns all medicalFiles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} medicalFile`;
  }

  update(id: number, updateMedicalFileDto: UpdateMedicalFileDto) {
    return `This action updates a #${id} medicalFile`;
  }

  remove(id: number) {
    return `This action removes a #${id} medicalFile`;
  }
}
