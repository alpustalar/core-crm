/* eslint-disable */
import {
  capabilitiesCreateManyInputs,
  clinicCreateInput,
  languageCreateManyInputs,
  masterTreatmentsCreateManyInputs,
  organizationCreateInput,
  rolesCreateManyInputs,
  sectorCreateInputs,
  sectorSlugs,
} from './data/modules';
import { PrismaClient, SectorType } from '@prisma/client';
import { LANGUAGE_CODES, LanguageCode } from '@src/domain/constants/db';

import { treatmentCategories } from '@src/infrastructure/persistence/prisma/data/modules/treatment-categories/treatment-categories';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seed başlıyor...');

  await prisma.$transaction(async (tx) => {
    // 1️⃣ create Organization
    const savedOrganization = await tx.organization.upsert({
      where: { slug: organizationCreateInput.slug },
      update: {},
      create: organizationCreateInput,
    });

    // sectors

    const savedSectors = await Promise.all(
      sectorCreateInputs.map((sectorCreateInput, key) =>
        tx.sector.upsert({
          where: { slug: sectorCreateInput.slug },
          update: {},
          create: sectorCreateInput,
        })
      )
    );

    const sectorIds = Object.fromEntries(
      savedSectors.map((s) => [s.slug, s.id])
    );

    // create clinic

    const dentalSector = savedSectors.find(
      (sector) => sector.slug === sectorSlugs[SectorType.DENTAL]
    );

    await tx.clinic.upsert({
      where: { slug: clinicCreateInput.slug },
      update: {},
      create: {
        ...clinicCreateInput,
        organization: { connect: { id: savedOrganization.id } },
        sector: { connect: { id: dentalSector!.id } },
      },
    });

    // create capabilities

    await tx.capability.createMany({
      data: capabilitiesCreateManyInputs.map(({ module, action, name }) => ({
        id: crypto.randomUUID(),
        module,
        action,
        name,
      })),
      skipDuplicates: true,
    });

    // create roles

    for (const role of rolesCreateManyInputs) {
      const savedRole = await tx.role.upsert({
        where: { slug: role.slug },
        update: {
          name: role.name,
          priority: role.priority,
          isSystemRole: role.isSystemRole,
        },
        create: {
          id: crypto.randomUUID(),
          slug: role.slug,
          name: role.name,
          priority: role.priority,
          isSystemRole: role.isSystemRole,
        },
      });

      await tx.roleCapability.deleteMany({
        where: { roleId: savedRole.id },
      });

      // capability id'lerini çek
      const capabilityRecords = await Promise.all(
        role.caps.map((cap) =>
          tx.capability.findUniqueOrThrow({
            where: {
              module_action: {
                module: cap.module,
                action: cap.action,
              },
            },
          })
        )
      );

      // yeniden bağla
      await tx.roleCapability.createMany({
        data: capabilityRecords.map((cap) => ({
          roleId: savedRole.id,
          capabilityId: cap.id,
          id: crypto.randomUUID(),
        })),
      });
    }

    // language oluştur. idleri al.

    await tx.language.createMany({
      data: languageCreateManyInputs.map((language) => ({
        name: language.name,
        code: language.code,
        direction: language.direction,
        id: crypto.randomUUID(),
      })),
    });

    const findLanguages = await tx.language.findMany();

    const languageIds = Object.fromEntries(
      findLanguages.map((lang) => [lang.code, lang.id])
    ) as Record<LanguageCode, string>;

    // treatment Categories

    for (const treatmentCategory of treatmentCategories) {
      const { sectorSlug, categories } = treatmentCategory;

      // categories objesinin içindeki her bir categoryData (DIAGNOSIS, SURGERY vb.) üzerinde dönüyoruz
      for (const categoryData of Object.values(categories)) {
        await tx.treatmentCategory.upsert({
          where: {
            slug: categoryData.slug,
          },
          update: {},
          create: {
            id: crypto.randomUUID(),
            slug: categoryData.slug,
            sectorId: sectorIds[sectorSlug],
            translations: {
              createMany: {
                data: Object.values(LANGUAGE_CODES).map((code) => ({
                  languageId: languageIds[code],
                  name: categoryData.translations.name[code],
                  description: categoryData.translations.description[code],
                  id: crypto.randomUUID(),
                })),
              },
            },
          },
        });
      }

      const allCategories = await tx.treatmentCategory.findMany({
        where: { sectorId: sectorIds[sectorSlug] },
      });
      const categoryIdsBySlug = Object.fromEntries(
        allCategories.map((category) => [category.slug, category.id])
      );

      // --- 5️⃣ Master Treatments ---
      for (const treatment of masterTreatmentsCreateManyInputs) {
        await tx.masterTreatment.upsert({
          where: { slug: treatment.slug },
          update: {},
          create: {
            id: crypto.randomUUID(),
            slug: treatment.slug,
            treatmentCategoryId:
              categoryIdsBySlug[treatment.treatmentCategorySlug],
            defaultDuration: treatment.defaultDuration,
            translations: {
              createMany: {
                data: Object.values(LANGUAGE_CODES).map((code) => ({
                  id: crypto.randomUUID(),
                  languageId: languageIds[code],
                  name: treatment.translations.name[code] ?? '',
                  description: treatment.translations.description[code] ?? '',
                })),
              },
            },
          },
        });
      }
    }
  });

  console.log('🏁 Seed başarıyla tamamlandı.');
}

main()
  .catch((e) => {
    console.error('❌ Seed hata verdi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
