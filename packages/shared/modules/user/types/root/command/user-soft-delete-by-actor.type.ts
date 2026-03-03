import { z } from "zod";
import { UserSoftDeleteByActorSchema } from "@shared/modules/user/schemas/root/command";

// 3. Type
export type UserSoftDeleteByActor = z.infer<typeof UserSoftDeleteByActorSchema>;
