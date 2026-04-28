import { z } from "zod";
import {UpdateProviderSchema} from "@shared/modules/provider/schemas";

export type UpdateProvider = z.infer<typeof UpdateProviderSchema>;
