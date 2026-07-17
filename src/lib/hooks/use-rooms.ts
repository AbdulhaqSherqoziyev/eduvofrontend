import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomsApi, type AvailabilityParams } from '../api/rooms';
import type { CreateRoomInput } from '../types/room';

const KEY = 'rooms';

export function useRooms() {
  return useQuery({ queryKey: [KEY], queryFn: () => roomsApi.list() });
}

export function useRoomOptions() {
  const { data } = useRooms();
  return (data ?? []).map((r) => ({ value: r.id, label: r.name }));
}

export function useRoomAvailability(params: AvailabilityParams | null) {
  return useQuery({
    queryKey: [KEY, 'availability', params],
    queryFn: () => roomsApi.availability(params!),
    enabled: !!params?.date,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [KEY] });
}

export function useCreateRoom() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: roomsApi.create, onSuccess: invalidate });
}

export function useUpdateRoom(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: Partial<CreateRoomInput>) => roomsApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteRoom() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: roomsApi.softDelete, onSuccess: invalidate });
}
