export interface IBaseCommandRepository<TEntity> {
  update(entity: TEntity): Promise<TEntity>;
  findById(id: string): Promise<TEntity | null>;
  create(entity: TEntity): Promise<TEntity>;
}
