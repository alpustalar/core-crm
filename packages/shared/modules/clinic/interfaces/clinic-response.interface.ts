import { z } from "zod";
import { GlobalStatusSchema } from "@shared/generated-zod";

type GlobalStatus = z.infer<typeof GlobalStatusSchema>;

export interface IClinicResponse {
  id: string;
  name: string;
  slug: string;
  phone?: string;
  email?: string;
  city?: string;
  district?: string;
  status: GlobalStatus;
  timezone: string;
  createdAt: Date;
}
