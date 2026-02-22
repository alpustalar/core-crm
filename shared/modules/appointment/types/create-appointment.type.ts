import { createZodDto } from "nestjs-zod";
import { CreateAppointmentSchema } from "@shared/modules/appointment/schemas";

export class CreateAppointment extends createZodDto(CreateAppointmentSchema) {}
