import { Test, TestingModule } from '@nestjs/testing';
import { MedicalFilesService } from './medical-files.service';

describe('MedicalFilesService', () => {
  let service: MedicalFilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalFilesService],
    }).compile();

    service = module.get<MedicalFilesService>(MedicalFilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
