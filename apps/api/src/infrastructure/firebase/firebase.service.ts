import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { auth } from 'firebase-admin';
import {
  FIREBASE_ADMIN_TOKEN,
  IFirebaseService,
} from '@src/infrastructure/firebase/firebase.service.interface';
import DecodedIdToken = auth.DecodedIdToken;

@Injectable()
export class FirebaseService implements IFirebaseService {
  constructor(
    @Inject(FIREBASE_ADMIN_TOKEN) private readonly firebaseAdmin: typeof admin
  ) {}

  async createUser(dto: auth.CreateRequest) {
    return await this.firebaseAdmin.auth().createUser(dto);
  }

  async deleteUser(id: string) {
    return await this.firebaseAdmin.auth().deleteUser(id);
  }

  async changePassword({ id, password }: { id: string; password: string }) {
    return await this.firebaseAdmin.auth().updateUser(id, { password });
  }

  async generatePasswordResetLink(email: string) {
    return await this.firebaseAdmin.auth().generatePasswordResetLink(email);
  }

  async sendEmailVerificationLink(email: string) {
    return await this.firebaseAdmin.auth().generateEmailVerificationLink(email);
  }

  async verifyToken(idToken: string): Promise<DecodedIdToken | null> {
    return await this.firebaseAdmin.auth().verifyIdToken(idToken);
  }
}
