import { ICommand } from '@nestjs/cqrs';

export class SyncCampaignMetricsCommand implements ICommand {
  constructor(public readonly clinicId?: string) {}
}
