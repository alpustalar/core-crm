/* eslint-disable */
import { plainToInstance } from 'class-transformer';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import {
  SERIALIZE_METADATA,
  SerializeOptions,
} from '@common/decorators/serialize.decorator';
import { IRequestWithUser } from '@common/interfaces';
import { isDefined } from '@common/utils';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<IRequestWithUser>();
    const actor = request.actor;

    const options = this.reflector.get<SerializeOptions>(
      SERIALIZE_METADATA,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data) => {
        if (!isDefined(data)) return data;

        const isArray = Array.isArray(data);

        let policyInstance: any = null;
        if (options.policy && actor) {
          policyInstance = new options.policy(actor);
        }
        const transformItem = <T>(item: T) => {
          const groups = policyInstance
            ? policyInstance.groups(item)
            : undefined;

          return plainToInstance(options.dto, item, {
            groups: Array.isArray(groups) ? groups : undefined,
            excludeExtraneousValues: true,
          });
        };

        return isArray ? data.map(transformItem) : transformItem(data);
      }),
    );
  }
}
