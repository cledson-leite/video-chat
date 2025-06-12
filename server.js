import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => { 

  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  const onlineUsers = []
  io.on("connection", (socket) => {
    socket.on("create-room", (user) => {
      if(!user) return
      const isExist = onlineUsers.some(userOnline => userOnline.id === user.id)
      if(isExist) return
      onlineUsers.push({
        userId: user.id,
        socketId: socket.id,
        profile: user
      })
     io.emit("get-online-users", onlineUsers)
   })

    socket.on("disconnect", () => {
      const index = onlineUsers.findIndex(user => user.socketId === socket.id)
      onlineUsers.splice(index, 1)
      io.emit("get-online-users", onlineUsers)
   })

   socket.on("call", (participants) => {
    io.to(participants.destino.socketId).emit("incomingCall", participants)
   })

    socket.on('webRTCSignal', (data) => {
      const socketId = data.isCaller 
        ? data.onGoingCall?.participants?.destino.socketId 
        : data.onGoingCall?.participants?.origem.socketId
      if(!socketId) return
      io.to(socketId).emit('webRTCSignal', data)
    })

    socket.on('hangup', (data) => {
      const socketId = data?.onGoinCall?.participants.origem.socketId === data?.userHangingupId
        ? data.onGoinCall?.participants?.destino.socketId 
        : data.onGoinCall?.participants?.origem.socketId

      console.log(socketId, data.onGoinCall?.participants?.destino.socketId)
      
      if(!socketId) return
      io.to(socketId).emit('hangup')
    })
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});