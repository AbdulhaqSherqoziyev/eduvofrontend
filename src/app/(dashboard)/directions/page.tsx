import { Can } from '@/components/shared/can';
import { DirectionsGrid } from './_components/directions-grid';
import { AddDirectionDialog } from './_components/add-direction-dialog';

/** Directions (Yo'nalishlar) screen — grid of subject cards + create dialog. */
export default function DirectionsPage() {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex justify-end">
        <Can permission="subject.create">
          <AddDirectionDialog />
        </Can>
      </div>
      <DirectionsGrid />
    </section>
  );
}
