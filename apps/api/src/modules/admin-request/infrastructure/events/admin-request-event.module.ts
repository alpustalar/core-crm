import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  AdminRequestCreatedListener,
  AdminRequestReviewedListener,
} from './listeners';

export const ADMIN_REQUEST_LISTENERS = [
  AdminRequestCreatedListener,
  AdminRequestReviewedListener,
];

@Module({
  imports: [CqrsModule],
  providers: ADMIN_REQUEST_LISTENERS,
})
export class AdminRequestEventModule {}
