import { z } from "zod";
import { UpdateDoctorSchema } from "@shared/modules/doctor/schemas";

export type UpdateDoctor = z.infer<typeof UpdateDoctorSchema>;
