import { Module } from '@nestjs/common';
import { HealthTourismController } from '@modules/crm/health-tourism/presentation/http/controllers/health-tourism.controller';
import { HotelModule } from '../hotel/hotel.module';
import { TransferModule } from '../transfer/transfer.module';

@Module({
  imports: [HotelModule, TransferModule],
  controllers: [HealthTourismController],
})
export class HealthTourismPresentationModule {}
