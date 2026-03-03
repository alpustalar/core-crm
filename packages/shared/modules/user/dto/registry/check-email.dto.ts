import { CheckEmailSchema } from "@shared/modules/user/schemas/registry/check-email.schema";
import { createZodDto } from "nestjs-zod";

export class CheckEmailDto extends createZodDto(CheckEmailSchema) {}
