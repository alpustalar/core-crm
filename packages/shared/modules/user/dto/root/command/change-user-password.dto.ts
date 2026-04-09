import { createZodDto } from "nestjs-zod";
import { ChangeUserPasswordSchema } from "@shared/modules/user/schemas/root/command";

export class ChangeUserPasswordDto extends createZodDto(
  ChangeUserPasswordSchema,
) {}
