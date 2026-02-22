import { createZodDto } from "nestjs-zod";
import { UpdateClinicSchema } from "@shared/modules/clinic";

export class UpdateClinicDto extends createZodDto(UpdateClinicSchema) {}
