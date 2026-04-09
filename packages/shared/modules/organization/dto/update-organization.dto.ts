import { UpdateOrganizationSchema } from "@shared/modules/organization/schemas";
import { createZodDto } from "nestjs-zod";

export class UpdateOrganizationDto extends createZodDto(
  UpdateOrganizationSchema,
) {}
