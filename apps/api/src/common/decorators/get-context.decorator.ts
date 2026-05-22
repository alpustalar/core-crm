import { ActorContext, IRequestWithActor, IRequestWithPatient, PatientActorContext } from '@common/interfaces';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  ExecutionSource,
  ExecutionSources,
} from '@src/domain/constants/execution-source.constant';

export interface IGetContext {
  actor: ActorContext;
  source: ExecutionSource;
  ip?: string;
  userAgent?: string;
}

export const GetContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IGetContext => {
    const request = ctx.switchToHttp().getRequest<IRequestWithActor>();

    return {
      actor: request.actor as ActorContext,
      source: request.executionSource || ExecutionSources.USER_ACTION,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    };
  }
);

export const GetPatientContext = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): PatientActorContext => {
    const request = ctx.switchToHttp().getRequest<IRequestWithPatient>();
    return request.patientActor;
  }
);
