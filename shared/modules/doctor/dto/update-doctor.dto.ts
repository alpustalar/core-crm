import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { CreateDoctorSchema } from "@shared/modules/doctor/schemas";

export const UpdateDoctorSchema = z.lazy(() => CreateDoctorSchema.partial());

export class UpdateDoctorDto extends createZodDto(UpdateDoctorSchema) {}

export type UpdateDoctor = z.infer<typeof UpdateDoctorSchema>;
