import { createZodDto } from "nestjs-zod";
import { ConvertUserToDoctorSchema } from "@shared/modules/doctor/schemas";

export class ConvertUserToDoctorDto extends createZodDto(
  ConvertUserToDoctorSchema,
) {}
