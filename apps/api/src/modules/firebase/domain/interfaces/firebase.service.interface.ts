import { auth } from 'firebase-admin';
import { CreateUserDto } from '@shared/modules';

export interface IFirebaseService {
  createUser(dto: CreateUserDto): Promise<auth.UserRecord>;
  deleteUser(id: string): Promise<void>;
  changePassword(payload: {
    id: string;
    password: string;
  }): Promise<auth.UserRecord>;
  generatePasswordResetLink(email: string): Promise<string>;
  sendEmailVerificationLink(email: string): Promise<string>;
  verifyToken(idToken: string): Promise<auth.DecodedIdToken | null>;
}

export const FIREBASE_SERVICE_TOKEN = 'IFirebaseService';
