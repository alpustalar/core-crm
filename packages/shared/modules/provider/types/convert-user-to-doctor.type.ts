import { z } from "zod";
import { ConvertUserToDoctorSchema } from "@shared/modules/doctor/schemas";

export type ConvertUserToDoctor = z.infer<typeof ConvertUserToDoctorSchema>;
