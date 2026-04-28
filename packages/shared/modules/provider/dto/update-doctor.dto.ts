import { createZodDto } from "nestjs-zod";
import { UpdateProviderSchema } from "@shared/modules/provider/schemas";


export class UpdateDoctorDto extends createZodDto(UpdateProviderSchema) {}


