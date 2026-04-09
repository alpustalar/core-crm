import { z } from "zod";
import { UserSoftDeleteByActorSchema } from "@shared/modules/user/schemas/root/command";
export type UserSoftDeleteByActor = z.infer<typeof UserSoftDeleteByActorSchema>;
