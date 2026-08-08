import { Module } from '@nestjs/common';
import { ConsentFormPresentationModule } from './presentation/presentation.module';

@Module({ imports: [ConsentFormPresentationModule] })
export class ConsentFormModule {}
