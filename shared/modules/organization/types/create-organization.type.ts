import { z } from "zod";
import { CreateOrganizationSchema } from "@shared/modules/organization";

export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>;
