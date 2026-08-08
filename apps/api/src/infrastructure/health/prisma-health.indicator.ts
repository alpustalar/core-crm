import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { HealthIndicator } from '@src/http';

/**
 * api'nin PostgreSQL bağlantısı. Prisma çekirdekten bilinçle koparıldığı için
 * bu indicator çekirdekte değil, api'de yaşar — hata filtresindeki Prisma
 * dalıyla aynı gerekçe.
 *
 * Havuzdaki bir bağlantının gerçekten kullanılabilir olduğunu görmek için
 * en ucuz sorgu atılır; `$connect` çağrısı bağlantı zaten kuruluysa sorun
 * olmayan bir durumu da "sağlıklı" gösterebilirdi.
 */
@Injectable()
export class PrismaHealthIndicator implements HealthIndicator {
  readonly name = 'postgres';

  constructor(private readonly prisma: PrismaService) {}

  async isHealthy(): Promise<boolean> {
    await this.prisma.$queryRaw`SELECT 1`;
    return true;
  }
}
