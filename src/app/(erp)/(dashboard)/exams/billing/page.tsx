import { redirect } from 'next/navigation';

/** Old "Balans" screen → v3 "Kreditlar". */
export default function ExamBillingPage() {
  redirect('/exams/credits');
}
