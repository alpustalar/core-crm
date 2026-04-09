import { CreateUserSchema } from "@shared/modules/user/schemas/registry/create-user.schema";
import { z } from "zod";
export type CreateUser = z.infer<typeof CreateUserSchema>;
