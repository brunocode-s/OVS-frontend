import { io } from 'socket.io-client';

// Create the socket connection
const socket = io('http://localhost:5001', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

export default socket;
