import { UserResponseDto } from '@modules/identity/user/presentation/dto';
import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { UserTransformInterceptor } from '@modules/identity/user/presentation/user-transform.interceptor';

export function Serialize() {
  return applyDecorators(
    SetMetadata('serialize_dto', UserResponseDto),
    UseInterceptors(UserTransformInterceptor)
  );
}
