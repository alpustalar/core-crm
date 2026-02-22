import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TreatmentService } from './treatment.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { TreatmentCategory } from '@prisma/client';

@Controller('treatment')
export class TreatmentController {
  constructor(private readonly treatmentService: TreatmentService) {}

  @Post()
  create(@Body() createTreatmentDto: CreateTreatmentDto) {
    return this.treatmentService.create(createTreatmentDto);
  }

  @Get('categories')
  getCategories() {
    return Object.values(TreatmentCategory);
  }

  @Get('detail/:id')
  async getTreatment(@Param('id') id: string) {
    return await this.treatmentService.getTreatment(id);
  }

  @Get('clinic/:clinicId')
  async getClinicTreatments() {}

  @Get('master-treatments')
  async getMasterTreatments() {
    return await this.treatmentService.getMasterTreatments();
  }

  @Get()
  findAll() {
    return this.treatmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.treatmentService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTreatmentDto: UpdateTreatmentDto,
  ) {
    return this.treatmentService.update(+id, updateTreatmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.treatmentService.remove(+id);
  }
}
