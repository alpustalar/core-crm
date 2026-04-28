import { z } from "zod";
import {CreateProviderSchema} from "@shared/modules/provider/schemas/create-doctor.schema";

export const UpdateProviderSchema = z.lazy(() => CreateProviderSchema.partial());
