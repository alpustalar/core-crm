import { createZodDto } from 'nestjs-zod';
import { PatientBookAppointmentSchema } from '../../schemas/commands';

export class PatientBookAppointmentDto extends createZodDto(PatientBookAppointmentSchema) {}
