import { LearnerDetail } from '../../_components/learner-detail';

/** /owner/mock/learners/{id} — profile, credits, attempts, orders, owner actions. */
export default function OwnerMockLearnerPage({ params }: { params: { id: string } }) {
  return <LearnerDetail id={params.id} />;
}
