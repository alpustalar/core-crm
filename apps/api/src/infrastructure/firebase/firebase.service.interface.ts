import { auth } from 'firebase-admin';

export const FIREBASE_SERVICE = Symbol('IFirebaseService');
export const FIREBASE_ADMIN_TOKEN = Symbol('FIREBASE_ADMIN_TOKEN');

export interface IFirebaseService {
  createUser(dto: auth.CreateRequest): Promise<auth.UserRecord>;
  deleteUser(id: string): Promise<void>;
  changePassword(payload: {
    id: string;
    password: string;
  }): Promise<auth.UserRecord>;
  generatePasswordResetLink(email: string): Promise<string>;
  sendEmailVerificationLink(email: string): Promise<string>;
  verifyToken(idToken: string): Promise<auth.DecodedIdToken | null>;
}
