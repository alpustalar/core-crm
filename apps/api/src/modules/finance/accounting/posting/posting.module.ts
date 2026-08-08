import { Module } from '@nestjs/common';
import { PostingPresentationModule } from './presentation/presentation.module';

@Module({ imports: [PostingPresentationModule] })
export class PostingModule {}
