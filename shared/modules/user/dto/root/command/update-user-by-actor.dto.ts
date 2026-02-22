import { createZodDto } from "nestjs-zod";
import { UpdateUserByActorSchema } from "@shared/modules/user/schemas/root/command";

export class UpdateUserByActorDto extends createZodDto(
  UpdateUserByActorSchema,
) {}
