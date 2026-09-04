import { Suspense } from 'react';
import LoginForm from './LoginForm';

export const metadata = {
  title: 'Sign In — Stylist',
  description: 'Sign in to your AI Personal Stylist account.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-cream" />}>
      <LoginForm />
    </Suspense>
  );
}
