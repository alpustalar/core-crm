import { z } from "zod";
import { CreateClinicSchema } from "@shared/modules/clinic/schemas";

export type CreateClinic = z.infer<typeof CreateClinicSchema>;
