import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from './firebase.service';
import { FIREBASE_ADMIN_TOKEN } from './firebase.service.interface';

describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // FirebaseService artık firebase-admin'i FIREBASE_ADMIN_TOKEN ile inject ediyor.
      providers: [
        FirebaseService,
        { provide: FIREBASE_ADMIN_TOKEN, useValue: {} },
      ],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
