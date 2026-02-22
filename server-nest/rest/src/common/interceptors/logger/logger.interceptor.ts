/* eslint-disable */

import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { User } from '@prisma/client';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: User }>();
    const { method, url, body, user } = request;
    const now = Date.now();

    const safeBody = this.sanitizeBody(body);
    const userId = user?.id ? `[User: ${user.id}]` : '[Guest]';
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;

        // 2. Detaylı Log (Body ile birlikte)
        this.logger.log(
          `🌐${userId} ${method} ${url} | Status: ${response.statusCode} | Time: +${delay}ms`,
        );

        // Sadece POST, PATCH, PUT gibi body içeren isteklerde body'yi göster
        if (
          ['POST', 'PATCH', 'PUT'].includes(method) &&
          Object.keys(safeBody).length
        ) {
          this.logger.debug(`📦 Body: ${JSON.stringify(safeBody)}`);
        }
      }),
    );
  }

  private sanitizeBody(body: unknown) {
    if (!body) return {};
    const sanitized = { ...body };
    const blackList = [
      'password',
      'passwordConfirm',
      'oldPassword',
      'token',
      'accessToken',
      'fbToken',
    ];

    blackList.forEach((key: string) => {
      if (key in sanitized) sanitized[key] = '********';
    });

    return sanitized;
  }
}
