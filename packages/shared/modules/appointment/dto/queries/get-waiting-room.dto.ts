import { createZodDto } from 'nestjs-zod';
import { GetWaitingRoomSchema } from '@shared/modules/appointment/schemas/queries/get-waiting-room.schema';

export class GetWaitingRoomDto extends createZodDto(GetWaitingRoomSchema) {}
