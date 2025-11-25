import { io } from "socket.io-client"; 

// USE NGROK SOCKET URL
const SOCKET_URL = "https://backendddd-2xa6.onrender.com";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 2000,
  timeout: 20000,
  forceNew: true,
});

socket.on("connect", () => {
  console.log("🟢 User socket connected:", socket.id);
});

export default socket;
