import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  ITreatmentPackageCommandRepository
} from '@modules/clinical/treatment-package/domain/repositories/treatment-package.repository.interface';
import { TreatmentPackage } from '@modules/clinical/treatment-package/domain/entities/treatment-package.entity';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';
import { randomUUID } from 'crypto';

@Injectable()
export class TreatmentPackageCommandRepository
  extends BaseCommandRepository<TreatmentPackage>
  implements ITreatmentPackageCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: TreatmentPackage): Promise<TreatmentPackage> {
    const data = entity.toPersistence();
    const raw = await this.db.treatmentPackage.create({ data });
    entity.flushEvents();
    return new TreatmentPackage(raw);
  }

  async findById(id: string): Promise<TreatmentPackage | null> {
    const raw = await this.db.treatmentPackage.findUnique({ where: { id } });
    return raw ? new TreatmentPackage(raw) : null;
  }

  async save(treatmentPackage: TreatmentPackage): Promise<TreatmentPackage> {
    const data = treatmentPackage.toPersistence();
    const providerIds = treatmentPackage.providerIdsToSync;
    const items = treatmentPackage.itemsToSync;

    const executeQueries = async (dbInstance: any) => {
      // 1. Ana tabloyu (TreatmentPackage) upsert et
      const raw = await dbInstance.treatmentPackage.upsert({
        where: { id: treatmentPackage.id },
        create: data,
        update: data,
      });

      // 2. Sağlayıcılar (Providers) için senkronizasyon (Sadece değiştiyse/tanımlandıysa)
      if (providerIds !== undefined) {
        await dbInstance.treatmentPackageProvider.deleteMany({
          where: { packageId: treatmentPackage.id },
        });

        if (providerIds.length > 0) {
          await dbInstance.treatmentPackageProvider.createMany({
            data: providerIds.map((providerId) => ({
              id: randomUUID(),
              packageId: treatmentPackage.id,
              providerId,
            })),
          });
        }
      }

      // 3. Kalemler (Items) için senkronizasyon (Sadece değiştiyse/tanımlandıysa)
      if (items !== undefined) {
        await dbInstance.treatmentPackageItem.deleteMany({
          where: { packageId: treatmentPackage.id },
        });

        if (items.length > 0) {
          await dbInstance.treatmentPackageItem.createMany({
            data: items.map((item) => ({
              id: randomUUID(),
              packageId: treatmentPackage.id,
              treatmentId: item.treatmentId,
              count: item.count,
            })),
          });
        }
      }

      return raw;
    };

    let rawResult;
    if (txStorage.getStore()?.tx) {
      rawResult = await executeQueries(this.db);
    } else {
      rawResult = await this.prisma.$transaction(async (tx) => {
        return executeQueries(tx);
      });
    }

    treatmentPackage.flushEvents();
    return new TreatmentPackage(rawResult);
  }

  async saveMany(treatmentPackages: TreatmentPackage[]): Promise<void> {
    const executeAll = async (dbInstance: any) => {
      for (const pkg of treatmentPackages) {
        const data = pkg.toPersistence();
        const providerIds = pkg.providerIdsToSync;
        const items = pkg.itemsToSync;

        // Ana tabloyu güncelle
        await dbInstance.treatmentPackage.upsert({
          where: { id: pkg.id },
          create: data,
          update: data,
        });

        // İlişkileri senkronize et
        if (providerIds !== undefined) {
          await dbInstance.treatmentPackageProvider.deleteMany({
            where: { packageId: pkg.id },
          });
          if (providerIds.length > 0) {
            await dbInstance.treatmentPackageProvider.createMany({
              data: providerIds.map((providerId) => ({
                id: randomUUID(),
                packageId: pkg.id,
                providerId,
              })),
            });
          }
        }

        if (items !== undefined) {
          await dbInstance.treatmentPackageItem.deleteMany({
            where: { packageId: pkg.id },
          });
          if (items.length > 0) {
            await dbInstance.treatmentPackageItem.createMany({
              data: items.map((item) => ({
                id: randomUUID(),
                packageId: pkg.id,
                treatmentId: item.treatmentId,
                count: item.count,
              })),
            });
          }
        }
      }
    };

    if (txStorage.getStore()?.tx) {
      await executeAll(this.db);
    } else {
      await this.prisma.$transaction(async (tx) => {
        await executeAll(tx);
      });
    }

    // Toplu event flush
    treatmentPackages.forEach((pkg) => pkg.flushEvents());
  }
}
