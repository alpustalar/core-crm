export const asyncHandler = async <T, K = Error>(
  promise: Promise<T>,
): Promise<[T | null, K | null]> => {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error];
  }
};
