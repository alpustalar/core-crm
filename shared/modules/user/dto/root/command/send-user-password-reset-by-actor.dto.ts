import { createZodDto } from "nestjs-zod";
import { SendUserPasswordResetByActorSchema } from "@shared/modules/user/schemas/root/command";

export class SendUserPasswordResetByActorDto extends createZodDto(
  SendUserPasswordResetByActorSchema,
) {}
