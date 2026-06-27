import { GroupDetail } from './_components/group-detail';

/** Group detail screen — header + tabbed roster / attendance / homework / payments. */
export default function GroupDetailPage({ params }: { params: { id: string } }) {
  return <GroupDetail id={params.id} />;
}
