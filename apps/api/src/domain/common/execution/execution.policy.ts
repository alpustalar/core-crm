import {
  ExecutionSource,
  ExecutionSources,
} from '@src/domain/constants/execution-source.constant';

export class ExecutionPolicy {
  static isUserInitiated(source: ExecutionSource): boolean {
    return source === ExecutionSources.USER_ACTION;
  }

  static isSystemInitiated(source: ExecutionSource): boolean {
    const systemSources: ExecutionSource[] = [
      ExecutionSources.INTERNAL_CASCADE,
      ExecutionSources.SYSTEM_CRON,
      ExecutionSources.DATA_IMPORT,
    ];
    return systemSources.includes(source);
  }
}
