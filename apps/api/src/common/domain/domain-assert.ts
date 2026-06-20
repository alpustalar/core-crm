import { NotFoundException } from '@nestjs/common';

export class DomainAssert {
  public static exists<T>(entity: T | null | undefined, message: string): T {
    if (!entity) {
      throw new NotFoundException(message);
    }
    return entity;
  }
}
