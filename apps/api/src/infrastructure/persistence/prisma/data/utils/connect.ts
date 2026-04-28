export const connect = (id?: string) => (id ? { connect: { id } } : undefined);
