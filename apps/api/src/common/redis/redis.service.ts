import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { REDIS_KEYS } from './constants';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async isClinicDeactivated(clinicId: string) {
    const key = REDIS_KEYS.CLINIC.DEACTIVATED(clinicId);
    return !!(await this.redis.get(key));
  }

  async setClinicDeactivated(clinicId: string) {
    const key = REDIS_KEYS.CLINIC.DEACTIVATED(clinicId);
    await this.redis.set(key, 'true', 'EX', 86400);
  }

  async isUserDeactivated(userId: string) {
    const key = REDIS_KEYS.USER.BANNED(userId);
    return !!(await this.redis.get(key));
  }

  async setUserDeactivated(userId: string) {
    const key = REDIS_KEYS.USER.BANNED(userId);
    await this.redis.set(key, 'true', 'EX', 86400);
  }

  async setOrganizationDeactivated(organizationId: string) {
    await this.redis.set(
      REDIS_KEYS.ORGANIZATION.DEACTIVATED(organizationId),
      'true',
      'EX',
      86400
    );
  }

  async isOrganizationDeactivated(organizationId: string) {
    await this.redis.get(REDIS_KEYS.ORGANIZATION.DEACTIVATED(organizationId));
  }
}
