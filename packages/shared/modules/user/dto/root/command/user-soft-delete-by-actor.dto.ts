import { createZodDto } from "nestjs-zod";
import { UserSoftDeleteByActorSchema } from "@shared/modules/user/schemas/root/command";

export class UserSoftDeleteByActorDto extends createZodDto(
  UserSoftDeleteByActorSchema,
) {}
