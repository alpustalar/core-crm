import { z } from "zod";
import { SendUserPasswordResetByActorSchema } from "@shared/modules/user/schemas/root/command";
export type SendUserPasswordResetByActor = z.infer<typeof SendUserPasswordResetByActorSchema>;
