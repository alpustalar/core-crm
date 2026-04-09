import {
  capabilitiesCreateManyInputs,
  clinicCreateInput,
  masterTreatmentsCreateManyInputs,
  organizationCreateInput,
  rolesCreateManyInputs,
} from './data';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seed başlıyor...');

  await prisma.$transaction(async (tx) => {
    // 1️⃣ Organization
    const savedOrg = await tx.organization.upsert({
      where: { slug: organizationCreateInput.slug },
      update: {},
      create: organizationCreateInput,
    });

    // 2️⃣ Clinic
    const { organization: _, ...clinicData } = clinicCreateInput;

    await tx.clinic.upsert({
      where: { slug: clinicCreateInput.slug },
      update: {},
      create: {
        ...clinicData,
        organizationId: savedOrg.id,
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
        },
        create: {
          slug: role.slug,
          name: role.name,
          priority: role.priority,
        },
      });

      // eski capability bağlantılarını temizle
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
          }),
        ),
      );

      // yeniden bağla
      await tx.roleCapability.createMany({
        data: capabilityRecords.map((cap) => ({
          roleId: savedRole.id,
          capabilityId: cap.id,
        })),
      });
    }

    // 5️⃣ Master Treatments
    await tx.masterTreatment.createMany({
      data: masterTreatmentsCreateManyInputs,
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
