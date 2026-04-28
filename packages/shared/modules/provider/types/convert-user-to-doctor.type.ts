import { z } from "zod";
import {ConvertUserToProviderSchema} from "@shared/modules/provider/schemas";

export type ConvertUserToProvider = z.infer<typeof ConvertUserToProviderSchema>;
