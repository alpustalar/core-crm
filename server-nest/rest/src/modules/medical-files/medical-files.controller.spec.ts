import { Test, TestingModule } from '@nestjs/testing';
import { MedicalFilesController } from './medical-files.controller';
import { MedicalFilesService } from './medical-files.service';

describe('MedicalFilesController', () => {
  let controller: MedicalFilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalFilesController],
      providers: [MedicalFilesService],
    }).compile();

    controller = module.get<MedicalFilesController>(MedicalFilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
