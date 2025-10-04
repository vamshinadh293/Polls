import { io } from 'socket.io-client';

// Update this URL for production
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';

const socket = io(SOCKET_URL, { autoConnect: true });

export default socket;
