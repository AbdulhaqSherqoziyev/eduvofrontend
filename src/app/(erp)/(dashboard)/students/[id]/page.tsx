import { StudentProfileView } from './_components/student-profile';

/** Student profile — full info + stats (attendance, finance, assignments). */
export default function StudentProfilePage({ params }: { params: { id: string } }) {
  return <StudentProfileView id={params.id} />;
}
