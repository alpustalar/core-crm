import { Module } from '@nestjs/common';
import { ClinicHealthTourismConfigController } from '@modules/crm/health-tourism/config/presentation/http/controllers/clinic-health-tourism-config.controller';

@Module({ controllers: [ClinicHealthTourismConfigController] })
export class HealthTourismConfigPresentationModule {}
