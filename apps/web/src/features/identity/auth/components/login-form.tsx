'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/auth';
import {
  LoginFormSchema,
  type LoginForm as LoginFormValues,
} from '../schemas/login.schema';

/** Firebase hata kodlarını kullanıcıya gösterilebilir metne çevirir. */
function toReadableMessage(error: unknown): string {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      // Kullanıcının var olup olmadığını sızdırmamak için ikisine de aynı yanıt.
      return 'E-posta veya parola hatalı.';
    case 'auth/too-many-requests':
      return 'Çok fazla denendi. Bir süre sonra tekrar dene.';
    case 'auth/network-request-failed':
      return 'Ağ hatası. Bağlantını kontrol et.';
    default:
      return error instanceof Error
        ? error.message
        : 'Giriş yapılamadı. Tekrar dene.';
  }
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await signIn(values.email, values.password);
      // `replace` — geri tuşu giriş ekranına dönmesin.
      router.replace(searchParams.get('next') ?? '/dashboard');
      router.refresh();
    } catch (error) {
      setFormError(toReadableMessage(error));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Core CRM</CardTitle>
        <CardDescription>Devam etmek için giriş yap.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Parola</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-destructive text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          {formError && (
            <p role="alert" className="text-destructive text-sm">
              {formError}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Giriş yap
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
