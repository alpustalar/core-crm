import { Module } from '@nestjs/common';
import { NotificationPresentationModule } from './presentation/presentation.module';

@Module({ imports: [NotificationPresentationModule] })
export class NotificationModule {}
