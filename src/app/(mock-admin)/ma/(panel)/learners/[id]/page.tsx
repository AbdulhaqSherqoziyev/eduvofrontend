import type { Metadata } from 'next';
import { LearnerProfileScreen } from '@/components/mock-admin/screens/learner-profile';

export const metadata: Metadata = { title: "O'quvchi" };

export default function Page({ params }: { params: { id: string } }) {
  return <LearnerProfileScreen id={params.id} />;
}
