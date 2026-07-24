import { applyDecorators, Type, UseInterceptors } from '@nestjs/common';
import { MixinTransformInterceptor } from '@common/interceptors/transform/transform.interceptor';

/**
 * @Serialize
 * Gelen ham entity verisini, belirtilen DTO şemasına ve meta serialization gruplarına göre filtreler.
 * * @param dto Dönüştürülecek hedef DTO sınıfı (Örn: AppointmentResponseDto)
 */
export function Serialize<TEntity, TDto>(dto: Type<TDto>) {
  return applyDecorators(
    UseInterceptors(MixinTransformInterceptor<TEntity, TDto>(dto))
  );
}
