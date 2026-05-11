import { LogSource } from '@src/domain/constants/log-action.constant';
import { ActorContext } from '@common/interfaces';

export const SYSTEM_ACTOR: ActorContext = {
  userId: 'SYSTEM',
  email: 'system@bursadentistry.com',
  rolePriority: 999,
  capabilities: ['*'],
  source: LogSource.SYSTEM,
};
