import { ProfileForm } from './_components/profile-form';
import { PasswordForm } from './_components/password-form';

/** Self-service profile — any logged-in user edits their own name, phone and
 *  password. No special permission required. */
export default function ProfilePage() {
  return (
    <section className="grid max-w-3xl gap-5 md:grid-cols-2">
      <ProfileForm />
      <PasswordForm />
    </section>
  );
}
