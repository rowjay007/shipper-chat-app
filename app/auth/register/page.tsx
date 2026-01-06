import { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/registerForm'

export const metadata: Metadata = {
  title: 'Register - Shipper Chat',
  description: 'Create your account',
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/10 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join thousands of users already chatting
          </p>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-lg">
          <RegisterForm />
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{' '}
            </span>
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

