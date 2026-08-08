import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

const LOGIN_PATH = '/login';

/**
 * Yalnız **yönlendirme** yapar, yetkilendirme değil. Çerezin varlığı "oturum
 * açılmış olabilir" demek; geçerliliğini her istekte backend `AuthGuard`
 * doğruluyor. Burada token'ı çözmeye çalışmak (Edge runtime'da Firebase Admin
 * yok) hem imkânsız hem gereksiz.
 *
 * Dosya adı `middleware.ts` değil `proxy.ts`: Next 16 konvansiyonu yeniden
 * adlandırdı ve eskisi derlemede uyarı veriyor. Dışa açılan fonksiyonun adı da
 * `proxy` olmak zorunda (varsayılan dışa aktarım da kabul ediliyor).
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  const { pathname, search } = request.nextUrl;

  const isLoginPage = pathname === LOGIN_PATH;

  if (!hasSession && !isLoginPage) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    // Giriş sonrası kullanıcıyı gitmek istediği yere bırakalım.
    if (pathname !== '/') loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Statik varlıklar ve oturum route handler'ı dışarıda: sonuncusu çereze
   * *yazan* uç, onu çerez yokluğuna bakıp yönlendirseydik giriş hiç tamamlanamaz
   * (çerezi yazmak için çerez isteyen bir döngü) olurdu.
   */
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.svg$).*)'],
};
