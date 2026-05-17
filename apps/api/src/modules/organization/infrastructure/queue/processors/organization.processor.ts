/* eslint-disable */
import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ORGANIZATION_JOBS, QUEUES } from '@common/constants';
import { ClinicModuleApi } from '@modules/clinic/clinic.module.api';
import { UserModuleApi } from '@modules/user/user.module.api';
import { AppointmentModuleApi } from '@modules/appointment/appointment-module.api';

@Processor(QUEUES.ORGANIZATION)
export class OrganizationProcessor extends WorkerHost {
  private readonly logger = new Logger(OrganizationProcessor.name);

  constructor(
    private readonly clinicApi: ClinicModuleApi,
    private readonly userApi: UserModuleApi,
    private readonly appointmentApi: AppointmentModuleApi
  ) {
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
    await this.appointmentApi.softDeleteAppointmentsByOrganizationId(
      organizationId
    );
    await this.userApi.softDeleteManyWithAnOrganizationId(organizationId);
    await this.clinicApi.softDeleteManyWithAnOrganizationId(organizationId);
  }
}
