"use client";

import { DoorOpen } from "lucide-react";
import { QueryBoundary } from "@/components/shared/query-boundary";
import { CardGridSkeleton } from "@/components/shared/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useRooms } from "@/lib/hooks/use-rooms";
import { RoomCard } from "./room-card";

const GRID = "grid gap-5 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]";

/** Grid of room cards (rooms are few — no pagination). */
export function RoomsGrid() {
  const query = useRooms();
  return (
    <QueryBoundary
      query={query}
      loading={<CardGridSkeleton count={6} className={GRID} />}
      isEmpty={(d) => d.length === 0}
      empty={<EmptyState icon={<DoorOpen className="size-6" />} title="Xonalar yo‘q" hint="Birinchi xonani qo‘shing." />}
    >
      {(data) => (
        <div className={GRID}>
          {data.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </QueryBoundary>
  );
}
