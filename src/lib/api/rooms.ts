import { api } from './client';
import type { Room, CreateRoomInput, RoomAvailability } from '../types/room';

export interface AvailabilityParams {
  date: string;
  start?: string;
  end?: string;
}

export const roomsApi = {
  list: () => api.get<Room[]>('/rooms').then((r) => r.data),
  availability: (params: AvailabilityParams) =>
    api.get<RoomAvailability[]>('/rooms/availability', { params }).then((r) => r.data),
  create: (input: CreateRoomInput) => api.post<Room>('/rooms', input).then((r) => r.data),
  update: (id: string, input: Partial<CreateRoomInput>) =>
    api.patch<Room>(`/rooms/${id}`, input).then((r) => r.data),
  softDelete: (id: string) => api.delete(`/rooms/${id}`).then((r) => r.data),
};
