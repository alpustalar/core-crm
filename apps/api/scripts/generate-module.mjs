import fs from 'fs';
import path from 'path';

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('❌ Hata: Modül ismi girmelisiniz.');
  process.exit(1);
}

const toKebabCase = (str) =>
  str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

const toPascalCase = (str) =>
  toKebabCase(str)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

const toUpperSnakeCase = (str) =>
  str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toUpperCase();

const upper = toUpperSnakeCase(moduleName);
const lower = toKebabCase(moduleName);
const pascal = toPascalCase(moduleName);

const currentDir = process.cwd();
let modulesPath = '';

if (currentDir.endsWith('apps/api') || currentDir.endsWith('api')) {
  modulesPath = path.join(currentDir, 'src/modules');
} else {
  modulesPath = path.join(currentDir, 'apps/api/src/modules');
}

const basePath = path.join(modulesPath, lower);

const directories = [
  'application/policies',
  'application/commands',
  'application/queries',
  'domain/entities',
  'domain/repositories',
  'domain/services',
  'domain/interfaces',
  'domain/types',
  'domain/events',
  'infrastructure/persistence/prisma/mappers',
  'infrastructure/persistence/prisma/repositories',
  'infrastructure/queue/processors',
  'infrastructure/queue/producers',
  'infrastructure/events/listeners',
  'presentation/controllers',
  'presentation/dto',
];

directories.forEach((dir) => {
  const fullDirPath = path.join(basePath, dir);
  if (!fs.existsSync(fullDirPath)) {
    fs.mkdirSync(fullDirPath, { recursive: true });
  }
});

const createFile = (filePath, content) => {
  fs.writeFileSync(path.join(basePath, filePath), content.trim() + '\n');
};

// --- 1. En Dıştaki Main Module ---
createFile(
  `${lower}.module.ts`,
  `
import { Module } from '@nestjs/common';
import { ${pascal}PresentationModule } from '@modules/fns/presentation/fns-presentation.module';
import { ${pascal}PersistenceModule } from './infrastructure/persistence/prisma/${lower}-persistence.module';
import { ${pascal}EventModule } from './infrastructure/events/${lower}-event.module';
import { ${pascal}ModuleApi } from '@modules/fns/fns.module.api';
import { ${upper}_MODULE_API_TOKEN } from './domain/interfaces/fns.module.api.interface';

@Module({
  imports: [
    ${pascal}PersistenceModule,
    ${pascal}EventModule,
    ${pascal}PresentationModule,
  ],
  providers: [
    { 
      provide: ${upper}_MODULE_API_TOKEN, 
      useClass: ${pascal}ModuleApi 
    }
  ],
  exports: [${upper}_MODULE_API_TOKEN],
})
export class ${pascal}Module {}
`
);

// --- 2. Module API (Facade) ---
createFile(
  `${lower}.module.api.ts`,
  `
import { Injectable } from '@nestjs/common';

@Injectable()
export class ${pascal}ModuleApi {
  constructor() {}
}
`
);

// module api interface
createFile(
  `domain/interfaces/${lower}.module.api.interface.ts`,
  `
export const ${upper}_MODULE_API_TOKEN = Symbol('I${pascal}ModuleApi');

export interface I${pascal}ModuleApi {}

  `
);

// --- 4. Presentation Module ---
createFile(
  `presentation/${lower}-presentation.module.ts`,
  `
import { Module } from '@nestjs/common';
import { ${pascal}Controller } from './controllers/${lower}.controller';

@Module({
  controllers: [${pascal}Controller],
})
export class ${pascal}PresentationModule {}
`
);

// --- 5. Domain & Infrastructure Starters ---
createFile(
  `domain/repositories/${lower}.repository.interface.ts`,
  `export abstract class I${pascal}Repository {}`
);

// repo
createFile(
  `infrastructure/persistence/prisma/repositories/${lower}.repository.ts`,
  `
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { I${pascal}Repository } from '../../../../domain/repositories/${lower}.repository.interface';

@Injectable()
export class ${pascal}Repository extends BaseRepository implements I${pascal}Repository {}
`
);

//repo interface

createFile(
  `domain/repositories/${lower}.repository.ts`,
  `
export const ${upper}_REPO_TOKEN = Symbol('I${pascal}Repository');

export interface I${pascal}Repository {}
`
);

// event publisher interface
createFile(
  `domain/interfaces/${lower}-event-publisher.interface.ts`,
  `
export const ${upper}_EVENT_PUBLISHER_TOKEN = Symbol('I${pascal}EventPublisher');

export interface I${pascal}EventPublisher {}
`
);

// event publisher
createFile(
  `infrastructure/events/${lower}-event-publisher.service.ts`,
  `
import { Injectable } from '@nestjs/common';
import { I${pascal}EventPublisher } from '@modules/${lower}/domain/interfaces/$lower}-event-publisher.interface';


@Injectable()
export class ${pascal}EventPublisher implements I${pascal}EventPublisher {}
`
);

// event module
createFile(
  `infrastructure/events/${lower}-event.module.ts`,
  `
import { Module } from '@nestjs/common';
import { ${upper}_EVENT_PUBLISHER_TOKEN } from '../../domain/interfaces/${lower}-event-publisher.interface';
import { ${pascal}EventPublisher } from './${lower}-event-publisher.service';

@Module({
  imports: [],
  providers: [
    {
      provide: ${upper}_EVENT_PUBLISHER_TOKEN,
      useClass: ${pascal}EventPublisher,
    },
  ],
  exports: [${upper}_EVENT_PUBLISHER_TOKEN],
})
export class ${pascal}EventModule {}
`
);

// --- 6. Controller ---
createFile(
  `presentation/controllers/${lower}.controller.ts`,
  `
import { Controller } from '@nestjs/common';

@Controller('${lower}')
export class ${pascal}Controller {}
`
);

// persistence module

createFile(
  `infrastructure/persistence/prisma/${lower}-persistence.module.ts`,
  `
import { Module } from '@nestjs/common';
import { ${upper}_REPO_TOKEN } from '@modules/fns/domain/repositories/fns.repository';
import { ${pascal}Repository } from './repositories/${lower}.repository';

@Module({
  providers: [
    {
      provide: ${upper}_REPO_TOKEN,
      useClass: ${pascal}Repository,
    },
  ],
  exports: [${upper}_REPO_TOKEN],
})
export class ${pascal}PersistenceModule {}
`
);

createFile(
  'presentation/controllers/index.ts',
  `
  export * from './${lower}.controller';
  `
);

const appModulePath = path.join(currentDir, 'apps/api/src/app.module.ts');

if (fs.existsSync(appModulePath)) {
  let content = fs.readFileSync(appModulePath, 'utf8');

  // 1. Import satırını ekle (eğer yoksa)
  const importStatement = `import { ${pascal}Module } from './modules/${lower}/${lower}.module';\n`;
  if (!content.includes(importStatement)) {
    content = importStatement + content;
  }

  // 2. imports: [] dizisinin içine modülü ekle
  // Bu regex, 'imports: [' ifadesinden sonrasına modül ismini ekler
  if (!content.includes(`${pascal}Module`)) {
    content = content.replace(/(imports:\s*\[)/, `$1\n    ${pascal}Module,`);
  }

  fs.writeFileSync(appModulePath, content);
  console.log('✅ app.module.ts güncellendi.');
} else {
  console.warn('⚠️ app.module.ts bulunamadı, manuel ekleme yapmalısınız.');
}

console.log('Modül başarıyla oluşturuldu');
