import { createZodDto } from "nestjs-zod";
import { CreateOrganizationSchema } from "@shared/modules/organization/schemas";

export class CreateOrganizationDto extends createZodDto(
  CreateOrganizationSchema,
) {}
