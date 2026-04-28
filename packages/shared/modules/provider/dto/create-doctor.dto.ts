import { createZodDto } from "nestjs-zod";
import { CreateDoctorSchema } from "@shared/modules/doctor/schemas";

export class CreateDoctorDto extends createZodDto(CreateDoctorSchema) {}
