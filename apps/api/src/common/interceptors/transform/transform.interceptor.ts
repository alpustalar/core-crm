import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { QueryResponse } from '@shared/common/response/response.interface';

/**
 * MixinTransformInterceptor
 * @template TEntity Veri tabanından veya core domainden gelen ham veri tipi (Örn: Appointment, User)
 * @template TDto İstemciye dönülecek ve serialization gruplarını barındıran DTO sınıfı (Örn: AppointmentResponseDto)
 */
export function MixinTransformInterceptor<TEntity, TDto>(
  dto: Type<TDto>
): Type<NestInterceptor> {
  @Injectable()
  class MixinTransformInterceptorHost implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        map((response: QueryResponse<TEntity>) => {
          if (!response || !response.meta?.serializationOptions) {
            return response;
          }

          const {
            data,
            meta: { serializationOptions, ...restMeta },
          } = response;

          const options: ClassTransformOptions = {
            excludeExtraneousValues: true,
            exposeUnsetFields: false,
          };

          if (serializationOptions.isGroupActive) {
            options.groups = serializationOptions.groups;
          }

          const transformedData = Array.isArray(data)
            ? data.map((item) => plainToInstance(dto, item, options))
            : plainToInstance(dto, data, options);

          // `meta`'nın geri kalanı (özellikle `pagination`) korunur. Yalnız
          // `serializationOptions` ayıklanır; o zaten `serialization` altında
          // sadeleştirilmiş hâliyle dönüyor. Aksi hâlde serileştirme uygulanan
          // her liste endpoint'i sayfalama bilgisini sessizce kaybeder —
          // `users/all` handler'ı `pagination` üretiyordu ama istemciye hiç
          // ulaşmıyordu.
          const hasRestMeta = Object.keys(restMeta).length > 0;

          return {
            data: transformedData,
            ...(hasRestMeta ? { meta: restMeta } : {}),
            serialization: {
              groups: serializationOptions.groups,
            },
          };
        })
      );
    }
  }

  return MixinTransformInterceptorHost;
}
