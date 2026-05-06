import { AsyncLocalStorage } from 'async_hooks';
import { Prisma } from '@prisma/client';
import { DomainEvent } from '@common/interfaces';

export interface TransactionContext {
  tx?: Prisma.TransactionClient;
  events: DomainEvent[];
  correlationId: string;
}

export const txStorage = new AsyncLocalStorage<TransactionContext>();
