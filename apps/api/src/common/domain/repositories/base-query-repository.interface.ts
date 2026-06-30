export interface IBaseQueryRepository<TEntity> {
  findById(id: string): Promise<TEntity>;
}
