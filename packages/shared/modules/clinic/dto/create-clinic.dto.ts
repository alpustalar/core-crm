import { CreateClinicSchema } from "@shared/modules/clinic";
import { createZodDto } from "nestjs-zod";

export class CreateClinicDto extends createZodDto(CreateClinicSchema) {}
