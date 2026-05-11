import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { lastValueFrom, Observable } from 'rxjs';
import * as crypto from 'crypto';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction/als-storage';
import { DomainEvent } from '@common/interfaces';
import { Request } from 'express';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    const rawId =
      request.headers['x-correlation-id'] || request.headers['x-request-id'];

    const correlationId = Array.isArray(rawId)
      ? rawId[0]
      : (rawId ?? crypto.randomUUID());

    return new Observable((observer) => {
      void txStorage.run({ correlationId, events: [] }, async () => {
        try {
          const res = await lastValueFrom<unknown>(next.handle());
          const store = txStorage.getStore()!;
          this.processDomainEvents(store.events);
          observer.next(res);
          observer.complete();
        } catch (err) {
          observer.error(err);
        }
      });
    });
  }

  private processDomainEvents(events: DomainEvent[]) {
    if (events.length > 0) {
      console.log(`[TransactionInterceptor] Firing ${events.length} events.`);
    }
  }
}
