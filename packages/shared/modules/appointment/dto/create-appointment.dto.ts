import { createZodDto } from "nestjs-zod";
import { CreateAppointmentSchema } from "@shared/modules/appointment/schemas";

export class CreateAppointmentDto extends createZodDto(
  CreateAppointmentSchema,
) {}
