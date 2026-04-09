import { createZodDto } from "nestjs-zod";
import { CreateUserSchema } from "@shared/modules/user/schemas/registry/create-user.schema";

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
