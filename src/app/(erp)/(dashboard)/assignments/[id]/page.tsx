import { AssignmentDetail } from './_components/assignment-detail';

/** Assignment detail screen — info, submission stats, grading. */
export default function AssignmentDetailPage({ params }: { params: { id: string } }) {
  return <AssignmentDetail id={params.id} />;
}
