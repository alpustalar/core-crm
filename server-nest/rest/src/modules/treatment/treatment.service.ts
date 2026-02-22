import { Injectable } from '@nestjs/common';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TreatmentService {
  constructor(readonly prisma: PrismaService) {}

  create(createTreatmentDto: CreateTreatmentDto) {
    return 'This action adds a new treatment';
  }

  async getMasterTreatments() {
    return await this.prisma.masterTreatment.findMany();
  }

  async getTreatment(id: string) {
    return await this.prisma.treatment.findUnique({
      where: { id },
    });
  }

  findAll() {
    return `This action returns all treatment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} treatment`;
  }

  update(id: number, updateTreatmentDto: UpdateTreatmentDto) {
    return `This action updates a #${id} treatment`;
  }

  remove(id: number) {
    return `This action removes a #${id} treatment`;
  }
}
