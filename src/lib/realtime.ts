import { io, type Socket } from 'socket.io-client';
import { env } from './env';

export function connectCrmRealtime(
  branchId: string,
  token: string,
): Socket {
  return io(`${env.VITE_API_URL}/realtime`, {
    path: '/socket.io',
    query: { branchId },
    auth: { token },
    transports: ['websocket'],
  });
}
