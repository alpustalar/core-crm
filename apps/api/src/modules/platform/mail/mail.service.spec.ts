import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

const mockConfigValues: Record<string, string> = {
  EMAIL_ADDRESS: 'noreply@example.com',
  EMAIL_PASSWORD: 'test-password',
  EMAIL_SMTP_HOST: 'smtp.example.com',
  EMAIL_SMTP_PORT: '587',
};

const mockConfigService = {
  get: jest.fn((key: string): string | null => mockConfigValues[key] ?? null),
};

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('throws when EMAIL_ADDRESS env var is missing', async () => {
      mockConfigService.get.mockReturnValueOnce(null);
      await expect(
        service.sendVerificationEmail('to@example.com', 'https://verify.link'),
      ).rejects.toThrow('email ayar hatası');
    });
  });

  describe('sendClinicSoftDeleteRequestMail', () => {
    it('throws when EMAIL_ADDRESS env var is missing', async () => {
      mockConfigService.get.mockReturnValueOnce(null);
      await expect(
        service.sendClinicSoftDeleteRequestMail('to@example.com'),
      ).rejects.toThrow('email ayar hatası');
    });
  });
});
