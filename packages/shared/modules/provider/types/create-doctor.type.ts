import { z } from "zod";
import {CreateProviderSchema} from "@shared/modules/provider/schemas";

export type CreateProvider = z.infer<typeof CreateProviderSchema>;
