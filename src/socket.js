import { io } from 'socket.io-client';

// Create the socket connection
const socket = io('https://ovs-backend-1.onrender.com', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

export default socket;
