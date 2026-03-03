import { UpdateOrganizationSchema } from "@shared/modules/organization/schemas";
import { z } from "zod";

export type UpdateOrganization = z.infer<typeof UpdateOrganizationSchema>;
