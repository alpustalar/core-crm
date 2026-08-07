import { Injectable } from '@nestjs/common';
import { Account as IAccount } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IAccountQueryRepository } from '@modules/finance/accounting/chart-of-accounts/domain/repositories/account/account.query.repository';

@Injectable()
export class AccountQueryRepository
  extends BaseRepository
  implements IAccountQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAllByClinicId(clinicId: string): Promise<IAccount[]> {
    return this.db.account.findMany({
      where: { clinicId },
      orderBy: { code: 'asc' },
    });
  }
}
