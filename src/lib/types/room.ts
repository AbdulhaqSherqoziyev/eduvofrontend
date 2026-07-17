/** Room = "Xona" (a physical classroom). */
export interface Room {
  id: string;
  name: string;
  capacity: number | null;
  note: string;
  groupCount: number;
}

export interface CreateRoomInput {
  name: string;
  capacity?: number;
  note?: string;
}

export interface RoomBusySlot {
  start: string;
  end: string;
  groupName: string;
}

/** A room with its busy blocks for a given day + free flag for a tested slot. */
export interface RoomAvailability extends Room {
  busy: RoomBusySlot[];
  free: boolean;
}
