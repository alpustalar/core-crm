'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

/**
 * Yalnız tarayıcı tarafı. Backend kimlik doğrulamayı Firebase **Admin** SDK'sıyla
 * yapıyor (`AuthGuard` → `validateAndGetContext`); buradaki Web SDK'nın tek işi
 * kullanıcıyı oturum açtırıp ID token üretmek.
 *
 * Bu değerler gizli değil — Firebase Web yapılandırması tasarım gereği açıktır,
 * güvenlik kuralların ve backend doğrulamasından gelir.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseApp(): FirebaseApp {
  // Next'in hızlı yenilemesi modülü tekrar çalıştırabilir; ikinci `initializeApp`
  // hata verir.
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

/** Yapılandırma eksikse giriş ekranı sessizce çalışmaz — erken ve net söyle. */
export function assertFirebaseConfigured(): void {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
      'Firebase yapılandırması eksik. apps/web/.env.local içine NEXT_PUBLIC_FIREBASE_* değerlerini ekle (.env.example örnektir).'
    );
  }
}
