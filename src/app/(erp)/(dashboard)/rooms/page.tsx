import { Can } from '@/components/shared/can';
import { RoomsGrid } from './_components/rooms-grid';
import { AddRoomDialog } from './_components/add-room-dialog';

/** Rooms (Xonalar) screen — classroom CRUD; backs group + schedule booking. */
export default function RoomsPage() {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex justify-end">
        <Can permission="room.create">
          <AddRoomDialog />
        </Can>
      </div>
      <RoomsGrid />
    </section>
  );
}
