import { Module } from '@nestjs/common';
import { MetaAdsPresentationModule } from './presentation/presentation.module';

@Module({ imports: [MetaAdsPresentationModule] })
export class MetaAdsModule {}
