'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { signUp } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

const SIGNUP_IMAGE_SRC =
  'https://images.performgroup.com/di/library/omnisport/5e/54/pep-guardiola_1db7bc8l5o46b1mx7ppbdm2lxy.png?t=1524093545&w=1200&h=630';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const { error: signUpError } = await signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    if (signUpError) {
      setError(signUpError.message ?? 'Something went wrong');
      return;
    }

    router.push('/players');
  };

  return (
    <div className={cn('auth-theme flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden border border-white/[0.06] bg-[#0a1019]/90 p-0 shadow-[0_30px_80px_-40px_rgba(0,224,148,0.18)] ring-0 backdrop-blur-2xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Create your account
                </h1>
                <p className="text-balance text-sm text-[#707972]">
                  Fill in the form below to create your ScoutDB account
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="name" className="text-neutral-200">
                  Full name
                </FieldLabel>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  className="border-white/[0.08] bg-white/[0.02] text-white placeholder:text-[#707972]/70 focus-visible:border-[#00E094]/50 focus-visible:ring-[#00E094]/20"
                  {...register('name')}
                />
                {errors.name && (
                  <FieldError errors={[{ message: errors.name.message }]} />
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="email" className="text-neutral-200">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  className="border-white/[0.08] bg-white/[0.02] text-white placeholder:text-[#707972]/70 focus-visible:border-[#00E094]/50 focus-visible:ring-[#00E094]/20"
                  {...register('email')}
                />
                {errors.email && (
                  <FieldError errors={[{ message: errors.email.message }]} />
                )}
                <FieldDescription className="text-[#707972]">
                  We&apos;ll use this to contact you. We will not share your
                  email with anyone else.
                </FieldDescription>
              </Field>

              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel
                      htmlFor="password"
                      className="text-neutral-200"
                    >
                      Password
                    </FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      className="border-white/[0.08] bg-white/[0.02] text-white placeholder:text-[#707972]/70 focus-visible:border-[#00E094]/50 focus-visible:ring-[#00E094]/20"
                      {...register('password')}
                    />
                    {errors.password && (
                      <FieldError
                        errors={[{ message: errors.password.message }]}
                      />
                    )}
                  </Field>
                  <Field>
                    <FieldLabel
                      htmlFor="confirmPassword"
                      className="text-neutral-200"
                    >
                      Confirm password
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      className="border-white/[0.08] bg-white/[0.02] text-white placeholder:text-[#707972]/70 focus-visible:border-[#00E094]/50 focus-visible:ring-[#00E094]/20"
                      {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && (
                      <FieldError
                        errors={[
                          { message: errors.confirmPassword.message },
                        ]}
                      />
                    )}
                  </Field>
                </Field>
                <FieldDescription className="text-[#707972]">
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>

              {error && (
                <Field>
                  <FieldError>{error}</FieldError>
                </Field>
              )}

              <Field>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="bg-[#00E094] font-semibold text-[#08110b] shadow-[0_8px_24px_-8px_rgba(0,224,148,0.5)] transition-all hover:bg-[#00E094]/90 disabled:opacity-70"
                >
                  {isSubmitting ? 'Creating account…' : 'Create Account'}
                </Button>
                <FieldDescription className="text-center text-[#707972]">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-[#00E094] underline-offset-4 transition-colors hover:text-[#00E094]/80 hover:underline"
                  >
                    Sign in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>

          <div className="relative hidden bg-[#080d14] md:block">
            <img
              src={SIGNUP_IMAGE_SRC}
              alt="Pep Guardiola"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#080d14]/60 via-transparent to-[#7533FC]/10"
              aria-hidden
            />
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-xs text-[#707972]">
        By clicking continue, you agree to our{' '}
        <a
          href="#"
          className="text-[#0C65D4] underline-offset-4 hover:text-[#0C65D4]/80 hover:underline"
        >
          Terms of Service
        </a>{' '}
        and{' '}
        <a
          href="#"
          className="text-[#0C65D4] underline-offset-4 hover:text-[#0C65D4]/80 hover:underline"
        >
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
