import fs from 'fs';
import path from 'path';

const groupArg = process.argv[2];
const moduleArg = process.argv[3];

if (!groupArg || !moduleArg) {
  console.error('❌ Kullanım: node generate-module.mjs <grup> <modül>');
  console.error('   Örnek:   node generate-module.mjs crm lead');
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
  toKebabCase(str).replace(/-/g, '_').toUpperCase();

const group = toKebabCase(groupArg);
const lower = toKebabCase(moduleArg);
const pascal = toPascalCase(moduleArg);
const upper = toUpperSnakeCase(moduleArg);

const currentDir = process.cwd();
let modulesPath;

if (currentDir.endsWith('apps/api') || currentDir.endsWith('api')) {
  modulesPath = path.join(currentDir, 'src/modules');
} else {
  modulesPath = path.join(currentDir, 'apps/api/src/modules');
}

const groupPath = path.join(modulesPath, group);
if (!fs.existsSync(groupPath)) {
  console.error(`❌ Grup bulunamadı: ${group}`);
  process.exit(1);
}

const basePath = path.join(groupPath, lower);
const alias = `@modules/${group}/${lower}`;

const directories = [
  'application/policies',
  'application/commands',
  'application/queries',
  `domain/entities`,
  `domain/repositories`,
  `domain/services`,
  `domain/interfaces`,
  `domain/types`,
  `domain/events`,
  `infrastructure/persistence/prisma/repositories/${lower}`,
  `infrastructure/queue/processors`,
  `infrastructure/queue/producers`,
  `infrastructure/events/listeners`,
  `presentation/controllers`,
];

directories.forEach((dir) => {
  const fullDirPath = path.join(basePath, dir);
  if (!fs.existsSync(fullDirPath)) {
    fs.mkdirSync(fullDirPath, { recursive: true });
  }
});

const createFile = (filePath, content) => {
  fs.writeFileSync(path.join(basePath, filePath), content.trimStart() + '\n');
};

// 1. Main module
createFile(
  `${lower}.module.ts`,
  `
import { Module } from '@nestjs/common';
import { ${pascal}PresentationModule } from './presentation/${lower}-presentation.module';

@Module({
  imports: [${pascal}PresentationModule],
})
export class ${pascal}Module {}
`
);

// 2. Presentation module
createFile(
  `presentation/${lower}-presentation.module.ts`,
  `
import { Module } from '@nestjs/common';
import { ${pascal}Controller } from './controllers/${lower}.controller';
import { ${pascal}CommandModule } from '${alias}/application/commands/command.module';
import { ${pascal}QueryModule } from '${alias}/application/queries/query.module';

@Module({
  imports: [${pascal}CommandModule, ${pascal}QueryModule],
  controllers: [${pascal}Controller],
})
export class ${pascal}PresentationModule {}
`
);

// 3. Controller
createFile(
  `presentation/controllers/${lower}.controller.ts`,
  `
import { Controller } from '@nestjs/common';

@Controller('${lower}')
export class ${pascal}Controller {}
`
);

createFile(
  `presentation/controllers/index.ts`,
  `export * from './${lower}.controller';\n`
);

// 4. Command module (boş — generate-cqrs ile handler eklenecek)
createFile(
  `application/commands/command.module.ts`,
  `
import { Module } from '@nestjs/common';
import { ${pascal}RepositoryModule } from '${alias}/infrastructure/persistence/prisma/repositories/${lower}/${lower}.repository.module';
import { ${pascal}EventModule } from '${alias}/infrastructure/events/${lower}-event.module';

const CommandHandlers = [];

@Module({
  imports: [${pascal}RepositoryModule, ${pascal}EventModule],
  providers: CommandHandlers,
  exports: CommandHandlers,
})
export class ${pascal}CommandModule {}
`
);

// 5. Query module (boş — generate-cqrs ile handler eklenecek)
createFile(
  `application/queries/query.module.ts`,
  `
import { Module } from '@nestjs/common';
import { ${pascal}RepositoryModule } from '${alias}/infrastructure/persistence/prisma/repositories/${lower}/${lower}.repository.module';

const QueryHandlers = [];

@Module({
  imports: [${pascal}RepositoryModule],
  providers: QueryHandlers,
  exports: QueryHandlers,
})
export class ${pascal}QueryModule {}
`
);

// 6. Domain repository interface (command + query split)
createFile(
  `domain/repositories/${lower}.repository.interface.ts`,
  `
export const ${upper}_COMMAND_REPOSITORY = Symbol('I${pascal}CommandRepository');
export const ${upper}_QUERY_REPOSITORY = Symbol('I${pascal}QueryRepository');

export interface I${pascal}CommandRepository {}

export interface I${pascal}QueryRepository {}
`
);

// 7. Event publisher interface
createFile(
  `domain/interfaces/${lower}-event-publisher.interface.ts`,
  `
export const ${upper}_EVENT_PUBLISHER = Symbol('I${pascal}EventPublisher');

export interface I${pascal}EventPublisher {}
`
);

// 8. Command repository
createFile(
  `infrastructure/persistence/prisma/repositories/${lower}/${lower}.command.repository.ts`,
  `
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { I${pascal}CommandRepository } from '${alias}/domain/repositories/${lower}.repository.interface';

@Injectable()
export class ${pascal}CommandRepository
  extends BaseRepository
  implements I${pascal}CommandRepository {}
`
);

// 9. Query repository
createFile(
  `infrastructure/persistence/prisma/repositories/${lower}/${lower}.query.repository.ts`,
  `
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { I${pascal}QueryRepository } from '${alias}/domain/repositories/${lower}.repository.interface';

@Injectable()
export class ${pascal}QueryRepository
  extends BaseRepository
  implements I${pascal}QueryRepository {}
`
);

// 10. Repository module
createFile(
  `infrastructure/persistence/prisma/repositories/${lower}/${lower}.repository.module.ts`,
  `
import { Module } from '@nestjs/common';
import {
  ${upper}_COMMAND_REPOSITORY,
  ${upper}_QUERY_REPOSITORY,
} from '${alias}/domain/repositories/${lower}.repository.interface';
import { ${pascal}CommandRepository } from './${lower}.command.repository';
import { ${pascal}QueryRepository } from './${lower}.query.repository';

@Module({
  providers: [
    { provide: ${upper}_COMMAND_REPOSITORY, useClass: ${pascal}CommandRepository },
    { provide: ${upper}_QUERY_REPOSITORY, useClass: ${pascal}QueryRepository },
  ],
  exports: [${upper}_COMMAND_REPOSITORY, ${upper}_QUERY_REPOSITORY],
})
export class ${pascal}RepositoryModule {}
`
);

// 11. Event publisher service
createFile(
  `infrastructure/events/${lower}-event-publisher.service.ts`,
  `
import { Injectable } from '@nestjs/common';
import { ContextService } from '@src/infrastructure/context/context.service';
import { I${pascal}EventPublisher } from '${alias}/domain/interfaces/${lower}-event-publisher.interface';

@Injectable()
export class ${pascal}EventPublisher implements I${pascal}EventPublisher {
  constructor(private readonly contextService: ContextService) {}
}
`
);

// 12. Event module
createFile(
  `infrastructure/events/${lower}-event.module.ts`,
  `
import { Module } from '@nestjs/common';
import { ContextModule } from '@src/infrastructure/context/context.module';
import { ${upper}_EVENT_PUBLISHER } from '${alias}/domain/interfaces/${lower}-event-publisher.interface';
import { ${pascal}EventPublisher } from './${lower}-event-publisher.service';

@Module({
  imports: [ContextModule],
  providers: [
    { provide: ${upper}_EVENT_PUBLISHER, useClass: ${pascal}EventPublisher },
  ],
  exports: [${upper}_EVENT_PUBLISHER],
})
export class ${pascal}EventModule {}
`
);

// 13. app.module.ts güncelle
const appModulePath = path.join(
  currentDir.endsWith('apps/api') || currentDir.endsWith('api')
    ? currentDir
    : path.join(currentDir, 'apps/api'),
  'src/app.module.ts'
);

if (fs.existsSync(appModulePath)) {
  let content = fs.readFileSync(appModulePath, 'utf8');

  const importStatement = `import { ${pascal}Module } from '@modules/${group}/${lower}/${lower}.module';\n`;
  if (!content.includes(`${pascal}Module`)) {
    content = importStatement + content;
    content = content.replace(/(imports:\s*\[)/, `$1\n    ${pascal}Module,`);
    fs.writeFileSync(appModulePath, content);
    console.log(`✅ app.module.ts güncellendi — ${pascal}Module eklendi.`);
  } else {
    console.log(`ℹ️  ${pascal}Module zaten app.module.ts içinde.`);
  }
} else {
  console.warn('⚠️  app.module.ts bulunamadı, manuel ekleme yapmalısınız.');
}

console.log(`\n🚀 Modül oluşturuldu: ${group}/${lower}`);
