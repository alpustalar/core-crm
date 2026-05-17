import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { UserResponseDto } from '@modules/user/presentation/dto';
import { QueryResponse } from '@shared/common/response/response.interface';
import { User } from '@shared';

@Injectable()
export class UserTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // ... üst kısımlar aynı

    return next.handle().pipe(
      map((response: QueryResponse<User>) => {
        // 1. Temel kontrol: Eğer response formatı beklediğimiz gibi değilse olduğu gibi bırak
        if (!response || !response.meta?.serializationOptions) {
          return response;
        }

        const {
          data,
          meta: { serializationOptions },
        } = response;

        const options: ClassTransformOptions = {
          excludeExtraneousValues: true, // Sadece @Expose olanları al
          exposeUnsetFields: false, // undefined olanları JSON'dan at
        };

        if (serializationOptions.isGroupActive) {
          options.groups = serializationOptions.groups;
        }

        const transformedData = Array.isArray(data)
          ? data.map((item) => plainToInstance(UserResponseDto, item, options))
          : plainToInstance(UserResponseDto, data, options);

        return {
          data: transformedData,
          serialization: {
            groups: serializationOptions.groups,
          },
        };
      })
    );
  }
}
