import { AsyncLocalStorage } from 'async_hooks';
import { Prisma } from '@prisma/client';
import { IDomainEvent } from '@common/interfaces';

export interface TransactionContext {
  tx: Prisma.TransactionClient;
  events: IDomainEvent[];
}

export const txStorage = new AsyncLocalStorage<TransactionContext>();
