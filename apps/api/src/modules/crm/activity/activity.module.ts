import { Module } from '@nestjs/common';
import { ActivityPresentationModule } from './presentation/activity.presentation.module';

@Module({ imports: [ActivityPresentationModule] })
export class ActivityModule {}
