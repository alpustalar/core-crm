import { Prisma } from '@prisma/client';
import { capabilityHelper, ModelCapabilities } from '../utils';

type PrismaModelName = (typeof Prisma.ModelName)[keyof typeof Prisma.ModelName];

const MONGOOSE_MODELS = ['AuditLog'] as const;
type MongooseModelName = (typeof MONGOOSE_MODELS)[number];

type AllModels = PrismaModelName | MongooseModelName;
type CapabilityKeys = `${Uppercase<AllModels>}`;

export type CapabilitiesType = {
  [K in CapabilityKeys]: ModelCapabilities;
};

const prismaModels = Object.values(Prisma.ModelName);
const mongooseModels = [...MONGOOSE_MODELS] as string[];

export const CAPABILITIES = [...prismaModels, ...mongooseModels].reduce(
  (acc, model) => {
    const key = model.toUpperCase() as CapabilityKeys;
    acc[key] = capabilityHelper(model);
    return acc;
  },
  {} as CapabilitiesType
);

export const capabilitiesCreateManyInputs = Object.values(CAPABILITIES).flatMap(
  (modelCaps) => Object.values(modelCaps)
);
