/* eslint-disable */
import {
  capabilitiesCreateManyInputs,
  clinicCreateInput,
  connect,
  languageCreateManyInputs,
  masterTreatmentsCreateManyInputs,
  organizationCreateInput,
  rolesCreateManyInputs,
  sectorCreateInputs,
  sectorSlugs,
} from './data';
import { PrismaClient, SectorType } from '@prisma/client';
import { LANGUAGE_CODES, LanguageCode } from '@common/constants/db';
import { DENTAL_TREATMENT_CATEGORIES } from '@src/infrastructure/persistence/prisma/data/treatment-categories';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seed başlıyor...');

  await prisma.$transaction(async (tx) => {
    // 1️⃣ Organization
    const savedOrganization = await tx.organization.upsert({
      where: { slug: organizationCreateInput.slug },
      update: {},
      create: organizationCreateInput,
    });

    const savedSectors = await Promise.all(
      sectorCreateInputs.map((sectorCreateInput, key) =>
        tx.sector.upsert({
          where: { slug: sectorCreateInput.slug },
          update: {},
          create: sectorCreateInput,
        })
      )
    );

    const dentalSector = savedSectors.find(
      (sector) => sector.slug === sectorSlugs[SectorType.DENTAL]
    );

    const sectorIds = Object.fromEntries(
      savedSectors.map((s) => [s.slug, s.id])
    );

    const { organization: _, ...clinicData } = clinicCreateInput;

    await tx.clinic.upsert({
      where: { slug: clinicCreateInput.slug },
      update: {},
      create: {
        ...clinicData,
        organization: connect(savedOrganization.id),
        sector: { connect: { id: dentalSector!.id } },
      },
    });

    await tx.capability.createMany({
      data: capabilitiesCreateManyInputs.map(({ module, action, name }) => ({
        module,
        action,
        name,
      })),
      skipDuplicates: true,
    });

    for (const role of rolesCreateManyInputs) {
      const savedRole = await tx.role.upsert({
        where: { slug: role.slug },
        update: {
          name: role.name,
          priority: role.priority,
          isSystemRole: role.isSystemRole,
        },
        create: {
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
        })),
      });
    }

    // language oluştur. idleri al.

    await tx.language.createMany({
      data: languageCreateManyInputs.map((language) => ({
        name: language.name,
        code: language.code,
      })),
    });

    const findLanguages = await tx.language.findMany();

    const languageIds = Object.fromEntries(
      findLanguages.map((lang) => [lang.code, lang.id])
    ) as Record<LanguageCode, string>;

    const { sectorSlug, ...categories } = DENTAL_TREATMENT_CATEGORIES;

    for (const key of Object.keys(categories)) {
      const categoryData = categories[key as keyof typeof categories];

      await tx.treatmentCategory.upsert({
        where: {
          slug: categoryData.slug,
        },
        update: {},
        create: {
          slug: categoryData.slug,
          sectorId: sectorIds[sectorSlug],
          translations: {
            createMany: {
              data: [
                {
                  languageId: languageIds[LANGUAGE_CODES.TR],
                  name: categoryData[LANGUAGE_CODES.TR],
                },
                {
                  languageId: languageIds[LANGUAGE_CODES.EN],
                  name: categoryData[LANGUAGE_CODES.EN],
                },
              ],
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

    // 5️⃣ Master Treatments

    const masterTreatmentsData = masterTreatmentsCreateManyInputs.map(
      (treatment) => {
        return {
          slug: treatment.slug,
          sectorId: sectorIds[treatment.sectorSlug], // connect yerine doğrudan ID
          treatmentCategoryId:
            categoryIdsBySlug[treatment.treatmentCategorySlug], // slug üzerinden ID'yi bulduk
          defaultDuration: treatment.defaultDuration, // Varsa diğer alanlar
        };
      }
    );

    await tx.masterTreatment.createMany({
      data: masterTreatmentsData,
      skipDuplicates: true,
    });
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
