import { z } from 'zod';
import { GetWaitingRoomSchema } from '../../schemas/queries/get-waiting-room.schema';

export type GetWaitingRoom = z.infer<typeof GetWaitingRoomSchema>;
