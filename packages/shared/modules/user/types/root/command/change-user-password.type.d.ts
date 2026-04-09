import { z } from "zod";
import { ChangeUserPasswordSchema } from "@shared/modules/user/schemas/root/command";
export type ChangeUserPassword = z.infer<typeof ChangeUserPasswordSchema>;
