import { z } from "zod";
import { CreateDoctorSchema } from "@shared/modules/doctor/schemas";

export type CreateDoctor = z.infer<typeof CreateDoctorSchema>;
