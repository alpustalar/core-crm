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
  'application/dto',
  'application/use-cases/commands',
  'application/use-cases/queries',
  'application/use-cases/module',
  'domain/entities',
  'domain/repositories',
  'domain/services',
  'infrastructure/persistence/prisma/mapper',
  'infrastructure/persistence/prisma/repositories',
  'infrastructure/queue/processors',
  'infrastructure/queue/producers',
  'infrastructure/events/listeners',
  'infrastructure/events/publishers',
  'presentation/controllers',
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
import { ${pascal}UseCaseModule } from './application/use-cases/module';
import { ${pascal}PresentationModule } from './presentation/${lower}-presentation.module';
import { ${pascal}ModuleApi } from './${lower}-module.api';

@Module({
  imports: [
    ${pascal}UseCaseModule,
    ${pascal}PresentationModule,
  ],
  providers: [${pascal}ModuleApi],
  exports: [${pascal}ModuleApi],
})
export class ${pascal}Module {}
`
);

// --- 2. Module API (Facade) ---
createFile(
  `${lower}-module.api.ts`,
  `
import { Injectable } from '@nestjs/common';

@Injectable()
export class ${pascal}ModuleApi {
  constructor() {}
}
`
);

// --- 3. Use Case Module (Internal Injection) ---
createFile(
  `application/use-cases/${lower}-use-case.module.ts`,
  `
import { Module } from '@nestjs/common';

@Module({
  providers: [],
  exports: [],
})
export class ${pascal}UseCaseModule {}
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
createFile(
  `infrastructure/persistence/prisma/repositories/${lower}.repository.ts`,
  `
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base.repository';
import { I${pascal}Repository } from '../../../../domain/repositories/${lower}.repository.interface';

@Injectable()
export class ${pascal}Repository extends BaseRepository implements I${pascal}Repository {}
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

createFile(
  'presentation/controllers/index.ts',
  `
  export * from './${lower}.controller';
  `
);

console.log('Modül başarıyla oluşturuldu');
