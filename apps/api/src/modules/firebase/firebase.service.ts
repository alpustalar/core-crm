import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { auth } from 'firebase-admin';
import * as path from 'node:path';
import { CreateUserDto } from '@shared/modules';
import DecodedIdToken = auth.DecodedIdToken;

const firebaseSDKPath = path.resolve(
  process.cwd(),
  'secrets',
  'firebase-sdk.json'
);

@Injectable()
export class FirebaseService {
  onModuleInit() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseSDKPath),
      });
    }
  }

  async createUser(dto: CreateUserDto) {
    return await admin.auth().createUser(dto);
  }

  async deleteUser(id: string) {
    return await admin.auth().deleteUser(id);
  }

  async changePassword({ id, password }: { id: string; password: string }) {
    return await admin.auth().updateUser(id, { password });
  }

  async generatePasswordResetLink(email: string) {
    return await admin.auth().generatePasswordResetLink(email);
  }

  async sendEmailVerificationLink(email: string) {
    return await admin.auth().generateEmailVerificationLink(email);
  }

  async verifyToken(idToken: string): Promise<DecodedIdToken | null> {
    return await admin.auth().verifyIdToken(idToken);
  }
}
