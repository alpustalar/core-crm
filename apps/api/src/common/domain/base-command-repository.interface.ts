export interface IBaseCommandRepository<TEntity> {
  save(entity: TEntity): Promise<TEntity>;
  saveMany(entities: TEntity[]): Promise<void>;
}
