import { Test, TestingModule } from '@nestjs/testing';
import {
  FIREBASE_SERVICE,
  IFirebaseService,
} from '@modules/identity/auth/firebase/domain/interfaces/firebase.service.interface';
import { ChangePasswordHandler } from './change-password.handler';
import { ChangePasswordCommand } from './change-password.command';

describe('ChangePasswordHandler', () => {
  let handler: ChangePasswordHandler;
  let firebaseService: IFirebaseService;

  const mockFirebaseService = {
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordHandler,
        {
          provide: FIREBASE_SERVICE,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    handler = module.get<ChangePasswordHandler>(ChangePasswordHandler);
    firebaseService = module.get<IFirebaseService>(FIREBASE_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call firebaseService.changePassword with correct parameters', async () => {
    const command = new ChangePasswordCommand({ password: 'newPassword123' }, {
      actor: { userId: 'user-123' },
    } as any);

    await handler.execute(command);

    expect(firebaseService.changePassword).toHaveBeenCalledWith({
      id: 'user-123',
      password: 'newPassword123',
    });
  });

  it('should throw error if firebaseService fails', async () => {
    const error = new Error('Firebase error');
    jest.spyOn(firebaseService, 'changePassword').mockRejectedValueOnce(error);

    const command = new ChangePasswordCommand({ password: 'newPassword123' }, {
      actor: { userId: 'user-123' },
    } as any);

    await expect(handler.execute(command)).rejects.toThrow(error);
  });
});
