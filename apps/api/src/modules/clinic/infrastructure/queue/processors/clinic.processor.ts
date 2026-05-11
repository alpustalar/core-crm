import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { UserModuleApi } from '@modules/user/user.module.api';

@Processor('clinic-cleanup')
export class ClinicProcessor extends WorkerHost {
  constructor(private readonly userApi: UserModuleApi) {
    super();
  }

  async process(job: Job<{ clinicId: string }>): Promise<void> {
    const { clinicId } = job.data;

    console.log(`Job Id:${job.id} Clinic Clean Up: Klinik ${clinicId}`);

    await this.userApi.softDeleteManyWithAClinicId(clinicId);
  }
}
