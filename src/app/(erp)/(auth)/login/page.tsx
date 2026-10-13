import { LoginCard } from './_components/login-card';

/** Public login screen, centered on the soft radial canvas. */
export default function LoginPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 md:p-10"
      style={{ background: 'radial-gradient(120% 120% at 30% 10%, #EEF2F8 0%, #E8ECF3 55%, #DFE4ED 100%)' }}
    >
      <LoginCard />
    </div>
  );
}
