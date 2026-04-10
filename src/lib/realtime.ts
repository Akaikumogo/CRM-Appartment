import { io, type Socket } from 'socket.io-client';

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function connectCrmRealtime(
  branchId: string,
  token: string,
): Socket {
  return io(`${apiBase}/realtime`, {
    path: '/socket.io',
    query: { branchId },
    auth: { token },
    transports: ['websocket'],
  });
}
