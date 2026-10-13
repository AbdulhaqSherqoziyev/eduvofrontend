import { ProfileForm } from './_components/profile-form';
import { PasswordForm } from './_components/password-form';
import { TenantSettingsForm } from './_components/tenant-settings-form';
import { CashSettingsCard } from './_components/cash-settings-card';

/** Self-service profile — any logged-in user edits their own name, phone and
 *  password. No special permission required. */
export default function ProfilePage() {
  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <section className="grid gap-5 md:grid-cols-2">
        <ProfileForm />
        <PasswordForm />
      </section>
      <TenantSettingsForm />
      <CashSettingsCard />
    </div>
  );
}
