import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES, WORK_ORDER_JOBS } from '@common/constants';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { ScanOverdueWorkOrdersCommand } from '@modules/supply/work-order/application/commands/scan-overdue-work-orders/scan-overdue-work-orders.command';

@Processor(QUEUES.WORK_ORDER)
export class WorkOrderOverdueProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkOrderOverdueProcessor.name);

  constructor(private readonly commandBus: TSCommandBus) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case WORK_ORDER_JOBS.SCAN_OVERDUE:
        await this.commandBus.execute(new ScanOverdueWorkOrdersCommand());
        break;
      default:
        this.logger.warn(`Tanımlanmamış WorkOrder job: ${job.name}`);
    }
  }
}
