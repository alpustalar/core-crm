import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { SoftDeleteManyUsersByClinicIdCommand } from '@modules/user/application/commands/soft-delete-many-user-by-clinic-id/soft-delete-many-users-by-clinic-id.command';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

@Processor('clinic-cleanup')
export class ClinicProcessor extends WorkerHost {
  private readonly internalCtx = ExecutionContextFactory.createInternal();
  constructor(private readonly commandBus: TSCommandBus) {
    super();
  }

  async process(job: Job<{ clinicId: string }>): Promise<void> {
    const { clinicId } = job.data;

    console.log(`Job Id:${job.id} Clinic Clean Up: Klinik ${clinicId}`);

    await this.commandBus.execute(
      new SoftDeleteManyUsersByClinicIdCommand(clinicId, this.internalCtx)
    );
  }
}
