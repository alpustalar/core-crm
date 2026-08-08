import { redirect } from 'next/navigation';

/**
 * Kök adres kendi başına bir ekran değil. Oturumu olan `/dashboard`a gider;
 * olmayan zaten `middleware.ts` tarafından `/login`a çevrilmiş olur.
 */
export default function RootPage() {
  redirect('/dashboard');
}
