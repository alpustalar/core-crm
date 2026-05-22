const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

async function generate() {
  const modulesDir = path.join(process.cwd(), 'src', 'modules');

  if (!fs.existsSync(modulesDir)) {
    console.error(`❌ Hata: Modüller klasörü bulunamadı: ${modulesDir}`);
    process.exit(1);
  }

  const modules = fs
    .readdirSync(modulesDir)
    .filter((file) => fs.statSync(path.join(modulesDir, file)).isDirectory());

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedModule',
      message: 'Modül seçin:',
      choices: modules,
    },
    {
      type: 'list',
      name: 'type',
      message: 'Tür seçin:',
      choices: ['command', 'query'],
    },
    {
      type: 'input',
      name: 'caseName',
      message: 'Case adı (örn: create-user):',
      validate: (input) => (input.trim() ? true : 'Boş bırakılamaz!'),
    },
  ]);

  const { selectedModule, type, caseName } = answers;

  // Formatlamalar
  const kebabCase = caseName.toLowerCase().trim().replace(/\s+/g, '-');
  const camelCase = kebabCase.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  const pascalCase = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  const modulePascal =
    selectedModule.charAt(0).toUpperCase() + selectedModule.slice(1);

  const typeLabel = type === 'command' ? 'Command' : 'Query';
  const folderName = type === 'command' ? 'commands' : 'queries';

  const moduleBaseDir = path.join(
    modulesDir,
    selectedModule,
    'application',
    folderName
  );
  const targetDir = path.join(moduleBaseDir, kebabCase);

  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  // 1. Command/Query ve Handler Dosyaları (Tip Güvenli Hale Getirildi)
  const handlerClassName = `${pascalCase}Handler`;
  const responseClassName = `${pascalCase}${typeLabel}Response`;

  const mainTemplate = `import { I${typeLabel} } from '@nestjs/cqrs';
import { ${responseClassName} } from './${kebabCase}.response';

export class ${pascalCase}${typeLabel} implements I${typeLabel} {
  readonly __responseType!: ${responseClassName};

  constructor(public readonly payload: any) {}
}`;

  const handlerTemplate = `import { I${typeLabel}Handler, ${typeLabel}Handler } from '@nestjs/cqrs';
import { ${pascalCase}${typeLabel} } from './${kebabCase}.${type}';
import { ${responseClassName} } from './${kebabCase}.response';

@${typeLabel}Handler(${pascalCase}${typeLabel})
export class ${handlerClassName} implements I${typeLabel}Handler<${pascalCase}${typeLabel}, ${responseClassName}> {
  constructor() {}

  async execute(${type}: ${pascalCase}${typeLabel}): Promise<${responseClassName}> {
    const { payload } = ${type};
    
    // TODO: Implement business logic
    return {};
  }
}`;

  const responseTemplate = `export type ${responseClassName} = {};`;

  fs.writeFileSync(
    path.join(targetDir, `${kebabCase}.${type}.ts`),
    mainTemplate
  );
  fs.writeFileSync(
    path.join(targetDir, `${kebabCase}.handler.ts`),
    handlerTemplate
  );

  fs.writeFileSync(
    path.join(targetDir, `${kebabCase}.response.ts`),
    responseTemplate
  );

  // 2. Alt Modül Yönetimi (command.module.ts veya query.module.ts)
  const subModuleFileName = `${type}.module.ts`; // command.module.ts
  const subModuleFilePath = path.join(moduleBaseDir, subModuleFileName);
  const subModuleClassName = `${modulePascal}${typeLabel}Module`;
  const handlerArrayName = `${typeLabel}Handlers`;
  const relativeHandlerPath = `./${kebabCase}/${kebabCase}.handler`;

  if (!fs.existsSync(subModuleFilePath)) {
    const newModuleTemplate = `import { Module } from '@nestjs/common';\nimport { CqrsModule } from '@nestjs/cqrs';\nimport { ${handlerClassName} } from '${relativeHandlerPath}';\n\nconst ${handlerArrayName} = [\n  ${handlerClassName},\n];\n\n@Module({\n  imports: [CqrsModule],\n  providers: [...${handlerArrayName}],\n  exports: [...${handlerArrayName}],\n})\nexport class ${subModuleClassName} {}`;
    fs.writeFileSync(subModuleFilePath, newModuleTemplate);
    console.log(`✨ Alt modül oluşturuldu: ${subModuleFileName}`);
  } else {
    let content = fs.readFileSync(subModuleFilePath, 'utf-8');
    if (!content.includes(handlerClassName)) {
      content =
        `import { ${handlerClassName} } from '${relativeHandlerPath}';\n` +
        content;
      const regex = new RegExp(`const ${handlerArrayName} = \\[`, 'g');
      content = content.replace(
        regex,
        `const ${handlerArrayName} = [\n  ${handlerClassName},`
      );
      fs.writeFileSync(subModuleFilePath, content);
      console.log(`📝 ${subModuleFileName} güncellendi.`);
    }
  }

  // 3. Ana Modül Otomasyonu (src/modules/user/user.module.ts)
  const mainModuleFileName = `${selectedModule}.module.ts`;
  const mainModuleFilePath = path.join(
    modulesDir,
    selectedModule,
    mainModuleFileName
  );

  if (fs.existsSync(mainModuleFilePath)) {
    let mainContent = fs.readFileSync(mainModuleFilePath, 'utf-8');

    if (!mainContent.includes(subModuleClassName)) {
      // Import ekle (Path: @modules/user/application/commands/command.module)
      const importPath = `@modules/${selectedModule}/application/${folderName}/${type}.module`;
      const importLine = `import { ${subModuleClassName} } from '${importPath}';\n`;

      // Dosyanın en üstüne değil, mevcut importların oraya ekle
      mainContent = importLine + mainContent;

      // imports: [] dizisine ekle
      if (mainContent.includes('imports: [')) {
        mainContent = mainContent.replace(
          'imports: [',
          `imports: [\n    ${subModuleClassName},`
        );
      }

      fs.writeFileSync(mainModuleFilePath, mainContent);
      console.log(
        `🔗 ${subModuleClassName}, ${mainModuleFileName} içine otomatik bağlandı.`
      );
    }
  }

  console.log(`\n🚀 Başarıyla tamamlandı: ${kebabCase}`);
}

generate();
