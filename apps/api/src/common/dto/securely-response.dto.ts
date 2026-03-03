export abstract class SecurelyResponseDto {
  abstract isOwnedBy(id: string): boolean;
}
