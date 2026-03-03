import { z } from "zod";
import { CreateDoctorSchema } from "@shared/modules/doctor/schemas/create-doctor.schema";

export const UpdateDoctorSchema = z.lazy(() => CreateDoctorSchema.partial());
