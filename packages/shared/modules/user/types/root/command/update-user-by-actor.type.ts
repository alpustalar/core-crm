import { z } from "zod";
import { UpdateUserByActorSchema } from "@shared/modules/user/schemas/root/command";

export type UpdateUserByActor = z.infer<typeof UpdateUserByActorSchema>;
