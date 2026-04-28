import { createZodDto } from "nestjs-zod";
import {CreateProviderSchema} from "@shared/modules/provider/schemas";

export class CreateDoctorDto extends createZodDto(CreateProviderSchema) {}
