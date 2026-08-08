import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

const FALLBACK_IP = '85.34.78.112';

export const UserIp = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return (req.ip ?? FALLBACK_IP).replace('::ffff:', '');
  }
);
