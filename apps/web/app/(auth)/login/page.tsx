import { Suspense } from 'react';

import { LoginForm } from '@/features/identity/auth/components/login-form';

export const metadata = {
  title: 'Giriş — Core CRM',
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
