import 'server-only';

import { cookies } from 'next/headers';

import { SESSION_COOKIE_NAME } from './session';

/**
 * Sunucu bileşenlerinin / route handler'ların token'ı. İstemcideki gibi bir
 * sağlayıcıya kaydedilmez, çağrıya açıkça geçilir (`api(ep, { token })`) —
 * modül düzeyinde tutulsaydı istekler arasında sızardı.
 */
export async function getServerSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}
