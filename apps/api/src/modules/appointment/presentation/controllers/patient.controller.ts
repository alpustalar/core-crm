import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GetPatientAppointmentsUseCase } from '@modules/appointment/application/use-cases/queries';
import { BookAppointmentDto, PaginationDto } from '@shared';
import { Public } from '@common/decorators/public.decorator';
import { BookAppointmentUseCase } from '@modules/appointment/application/use-cases/commands';

@Public()
@Controller('patient')
export class PatientController {
  constructor(
    private readonly getPatientAppointmentsUseCase: GetPatientAppointmentsUseCase,
    private readonly bookAppointmentUseCase: BookAppointmentUseCase
  ) {}

  @Get(':patientId')
  getPatientAppointments(
    @Param('patientId') patientId: string,
    @Query() pagination: PaginationDto
  ) {
    return this.getPatientAppointmentsUseCase.execute(patientId, pagination);
  }

  @Post('book')
  book(@Body() dto: BookAppointmentDto) {
    return this.bookAppointmentUseCase.execute(dto);
  }
}
