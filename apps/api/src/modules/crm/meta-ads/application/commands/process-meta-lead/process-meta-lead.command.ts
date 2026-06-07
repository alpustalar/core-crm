import { ICommand } from '@nestjs/cqrs';

export interface MetaLeadWebhookPayload {
  metaLeadId: string;
  metaAdAccountId: string;
  formId?: string;
  campaignId?: string;
  campaignName?: string;
  adsetId?: string;
  adId?: string;
  name?: string;
  phone?: string;
  email?: string;
  rawData?: unknown;
}

export class ProcessMetaLeadCommand implements ICommand {
  constructor(public readonly payload: MetaLeadWebhookPayload) {}
}
