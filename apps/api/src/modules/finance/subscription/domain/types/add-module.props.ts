import { ActorContext } from '@common/interfaces';

export type AddModuleProps = {
  organizationId: string;
  moduleKey: string;
  actor: ActorContext;
  externalPriceId?: string;
};
