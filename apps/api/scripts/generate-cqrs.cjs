const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

async function generate() {
  const modulesDir = path.join(process.cwd(), 'src', 'modules');
  // 1. Modülleri listele
  const modules = fs
    .readdirSync(modulesDir)
    .filter((file) => fs.statSync(path.join(modulesDir, file)).isDirectory());

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedModule',
      message: 'Hangi modül için oluşturulsun?',
      choices: modules,
    },
    {
      type: 'list',
      name: 'type',
      message: 'Ne oluşturmak istiyorsun?',
      choices: ['command', 'query'],
    },
    {
      type: 'input',
      name: 'caseName',
      message: 'Case adı nedir? (örn: create-user veya get-user-detail)',
      validate: (input) => (input ? true : 'Case adı boş olamaz!'),
    },
  ]);

  const { selectedModule, type, caseName } = answers;

  // İsim Formatlamaları
  const kebabCase = caseName.toLowerCase().replace(/ /g, '-');
  const camelCase = kebabCase.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  const pascalCase = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);

  const typeLabel = type === 'command' ? 'Command' : 'Query';
  const folderName = type === 'command' ? 'commands' : 'queries';

  // Klasör Yolu: src/modules/modul/application/commands/case-adi
  const targetDir = path.join(
    modulesDir,
    selectedModule,
    'application',
    folderName,
    kebabCase
  );

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // --- TEMPLATES ---

  const commandOrQueryTemplate = `
export class ${pascalCase}${typeLabel} {
  constructor(public readonly payload: any) {}
}
`.trim();

  const handlerTemplate = `
import { I${typeLabel}Handler, ${typeLabel}Handler } from '@nestjs/cqrs';
import { ${pascalCase}${typeLabel} } from './${kebabCase}.${type}';

@${typeLabel}Handler(${pascalCase}${typeLabel})
export class ${pascalCase}Handler implements I${typeLabel}Handler<${pascalCase}${typeLabel}> {
  constructor() {}

  async execute(${type}: ${pascalCase}${typeLabel}): Promise<any> {
    const { payload } = ${type};
    // Business logic goes here
  }
}
`.trim();

  // Dosyaları Yaz
  const mainFile = path.join(targetDir, `${kebabCase}.${type}.ts`);
  const handlerFile = path.join(targetDir, `${kebabCase}.handler.ts`);

  fs.writeFileSync(mainFile, commandOrQueryTemplate);
  fs.writeFileSync(handlerFile, handlerTemplate);

  console.log(`\n✅ Başarıyla oluşturuldu:`);
  console.log(`📂 Klasör: ${targetDir}`);
  console.log(`📄 ${kebabCase}.${type}.ts`);
  console.log(`📄 ${kebabCase}.handler.ts`);
}

generate();
