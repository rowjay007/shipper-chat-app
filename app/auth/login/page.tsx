import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/loginForm'

export const metadata: Metadata = {
  title: 'Login - Shipper Chat',
  description: 'Sign in to your account',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/10 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue your conversations
          </p>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-lg">
          <LoginForm />
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Don't have an account?{' '}
            </span>
            <Link
              href="/auth/register"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

