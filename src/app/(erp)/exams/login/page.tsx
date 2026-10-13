import { CodeLoginForm } from '@/components/exams-hub/code-login-form';

/** /exams/login — PIN entry for centres without a student cabinet (_hub-design.md §7). No header. */
export default function ExamsCodeLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-10">
      <CodeLoginForm />
    </div>
  );
}
