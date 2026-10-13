'use client';

import { useState } from 'react';
import { useForm, type ChangeHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { NmInput } from '@/components/ui/nm-input';
import { NmButton } from '@/components/ui/nm-button';
import { FieldLabel } from '@/components/ui/label';
import { useAuth } from '@/providers/auth-provider';
import { cleanPhone, stripSpaces } from '@/lib/utils/normalize';

const schema = z.object({
  phone: z.string().min(7, 'Telefon raqamini kiriting'),
  password: z.string().min(1, 'Parolni kiriting'),
});
type Values = z.infer<typeof schema>;

export function LoginForm({ t }: { t: Record<string, string> }) {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  // +998 prefilled by default so the user only types the national number.
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { phone: '+998 ', password: '' } });
  const { errors, isSubmitting } = form.formState;

  const phoneField = form.register('phone');
  const passwordField = form.register('password');

  // Clean each keystroke/paste: phone → drop junk, password → no spaces.
  const clean =
    (fn: (v: string) => string, field: { onChange: ChangeHandler }) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.target.value = fn(e.target.value);
      void field.onChange(e);
    };

  const onSubmit = async (values: Values) => {
    try {
      // Safety net for browser autofill that may bypass onChange. The backend
      // matches the phone space-insensitively, so trimming is enough here.
      const u = await login({ phone: cleanPhone(values.phone).trim(), password: stripSpaces(values.password) });
      router.replace(u.isPlatform ? '/owner' : '/dashboard');
    } catch {
      form.setError('root', { message: t.error });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldLabel htmlFor="phone">{t.phone}</FieldLabel>
      <NmInput id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+998 90 123 45 67"
        icon={<Phone className="size-[18px]" />} className="mb-1"
        {...phoneField} onChange={clean(cleanPhone, phoneField)} />
      <p className="mb-4 min-h-4 text-[12px] font-semibold text-danger">{errors.phone?.message}</p>
      <FieldLabel htmlFor="password">{t.password}</FieldLabel>
      <div className="relative mb-1">
        <NmInput id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
          placeholder="••••••••" icon={<Lock className="size-[18px]" />} className="pr-[47px]"
          {...passwordField} onChange={clean(stripSpaces, passwordField)} />
        <button type="button" onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? t.hidePassword : t.showPassword}
          className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#9aa6b8] transition-colors hover:text-foreground">
          {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </div>
      <p className="mb-2 min-h-4 text-[12px] font-semibold text-danger">{errors.password?.message}</p>
      <div className="mb-6 text-right text-[13px] font-semibold text-primary">{t.forgot}</div>
      {errors.root ? (
        <p className="mb-3 rounded-ctl bg-[rgba(228,87,76,0.12)] px-4 py-2.5 text-[13px] font-semibold text-danger">
          {errors.root.message}
        </p>
      ) : null}
      <NmButton type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? '...' : t.submit}
      </NmButton>
      <p className="mt-6 text-center text-[12.5px] text-muted">{t.noAccount}</p>
    </form>
  );
}
