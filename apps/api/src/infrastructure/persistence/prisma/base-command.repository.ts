import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';

export abstract class BaseCommandRepository<TEntity>
  extends BaseRepository
  implements IBaseCommandRepository<TEntity>
{
  abstract save(entity: TEntity): Promise<TEntity>;
  abstract create(entity: TEntity): Promise<TEntity>;
  abstract findById(id: string): Promise<TEntity | null>;
}
