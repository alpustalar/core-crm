import { Prisma } from '@prisma/client';
import { capabilityHelper, ModelCapabilities } from '../utils';
import { MODULE_LABELS } from '../constants';

type PrismaModelName = (typeof Prisma.ModelName)[keyof typeof Prisma.ModelName];

const MONGOOSE_MODELS = ['AuditLog'] as const;
type MongooseModelName = (typeof MONGOOSE_MODELS)[number];

/**
 * Tek bir tabloya karşılık gelmeyen, **kesitsel (cross-cutting) yetki alanları**.
 *
 * `finance` bunlardan ilki: parasal görünürlük tek bir modelde değil, onlarca
 * tabloya yayılmış durumda (yevmiye, fatura, tahsilat, kasa, sipariş tutarları).
 * Her birine ayrı ayrı `journalentry:read`, `payment:read`… vermek yerine
 * "bu aktör para görebilir" kararı tek bir yetkiyle ifade edilir ve
 * `FinancePolicy` serileştirme gruplarını buna göre üretir.
 */
const VIRTUAL_MODULES = ['Finance'] as const;
type VirtualModuleName = (typeof VIRTUAL_MODULES)[number];

type AllModels = PrismaModelName | MongooseModelName | VirtualModuleName;
type CapabilityKeys = `${Uppercase<AllModels>}`;

export type CapabilitiesType = {
  [K in CapabilityKeys]: ModelCapabilities;
};

const prismaModels = Object.values(Prisma.ModelName);
const mongooseModels = [...MONGOOSE_MODELS] as string[];
const virtualModules = [...VIRTUAL_MODULES] as string[];

export const CAPABILITIES = [
  ...prismaModels,
  ...mongooseModels,
  ...virtualModules,
].reduce((acc, model) => {
  const key = model.toUpperCase() as CapabilityKeys;
  acc[key] = capabilityHelper(model);
  return acc;
}, {} as CapabilitiesType);

export const capabilitiesCreateManyInputs = Object.values(CAPABILITIES).flatMap(
  (modelCaps) => Object.values(modelCaps)
);

/**
 * Etiketi olmayan yetki modülleri. Rol yönetimi ekranında ham model adıyla
 * ("lead Oluştur") görünmesinler diye `MODULE_LABELS`'a eklenmeleri gerekir;
 * seed çalışırken uyarı basar (build'i kırmaz — yeni model eklemek engellenmemeli).
 */
export const capabilityModulesWithoutLabel = [
  ...prismaModels,
  ...mongooseModels,
  ...virtualModules,
]
  .map((model) => model.toLowerCase())
  .filter((module) => !(module in MODULE_LABELS));
