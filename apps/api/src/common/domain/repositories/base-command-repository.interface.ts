export interface IBaseCommandRepository<TEntity> {
  save(entity: TEntity): Promise<TEntity>;
  findById(id: string): Promise<TEntity | null>;
  create(entity: TEntity): Promise<TEntity>;
}
