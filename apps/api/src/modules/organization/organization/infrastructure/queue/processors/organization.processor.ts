/* eslint-disable */
import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ORGANIZATION_JOBS, QUEUES } from '@common/constants';
import { SoftDeleteAppointmentsByOrganizationIdCommand } from '@modules/clinical/appointment/application/commands/soft-delete-appointments-by-organization-id/soft-delete-appointments-by-organization-id.command';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { SoftDeleteManyUserByOrganizationIdCommand } from '@modules/identity/user/application/commands/soft-delete-many-user-by-organization-id/soft-delete-many-users-by-organization-id.command';
import { SoftDeleteManyClinicsByOrganizationIdCommand } from '@modules/organization/clinic/application/commands/soft-delete-many-clinics-by-organization-id/soft-delete-many-clinics-by-organization-id.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

@Processor(QUEUES.ORGANIZATION)
export class OrganizationProcessor extends WorkerHost {
  private readonly logger = new Logger(OrganizationProcessor.name);
  private readonly internalCtx = ExecutionContextFactory.createInternal();

  constructor(private readonly commandBus: TSCommandBus) {
    super();
  }

  async process(job: Job<any, any>): Promise<void> {
    const { data, name } = job;

    this.logger.log(`Processing job: ${name} (ID: ${job.id})`);

    try {
      switch (name) {
        case ORGANIZATION_JOBS.CLEAN_UP:
          await this.handleCleanup(data);
          break;

        default:
          this.logger.warn(`Unknown job name: ${name}`);
          break;
      }
    } catch (error) {
      this.logger.error(`Job failed: ${name}`);
      throw error;
    }
  }

  private async handleCleanup(data: { organizationId: string }) {
    const { organizationId } = data;

    await this.commandBus.execute(
      new SoftDeleteAppointmentsByOrganizationIdCommand(
        organizationId,
        this.internalCtx
      )
    );
    await this.commandBus.execute(
      new SoftDeleteManyUserByOrganizationIdCommand(
        organizationId,
        this.internalCtx
      )
    );
    await this.commandBus.execute(
      new SoftDeleteManyClinicsByOrganizationIdCommand(
        organizationId,
        this.internalCtx
      )
    );
  }
}
