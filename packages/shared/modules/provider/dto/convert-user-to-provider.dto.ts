import { createZodDto } from "nestjs-zod";
import {ConvertUserToProviderSchema} from "@shared/modules/provider/schemas";

export class ConvertUserToProviderDto extends createZodDto(
  ConvertUserToProviderSchema,
) {}
