import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MedicalFilesService } from './medical-files.service';
import { CreateMedicalFileDto } from './dto/create-medical-file.dto';
import { UpdateMedicalFileDto } from './dto/update-medical-file.dto';

@Controller('medical-files')
export class MedicalFilesController {
  constructor(private readonly medicalFilesService: MedicalFilesService) {}

  @Post()
  create(@Body() createMedicalFileDto: CreateMedicalFileDto) {
    return this.medicalFilesService.create(createMedicalFileDto);
  }

  @Get()
  findAll() {
    return this.medicalFilesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalFilesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedicalFileDto: UpdateMedicalFileDto) {
    return this.medicalFilesService.update(+id, updateMedicalFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicalFilesService.remove(+id);
  }
}
