export function paginate(
  page: number | string = 1,
  limit: number | string = 10,
) {
  page = Number(page);
  limit = Number(limit);
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
