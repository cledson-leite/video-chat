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
    socket.on("join-room", (user) => {
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
    console.log(participants.destino.profile.firstName)
    io.to(participants.destino.socketId).emit("incomingCall", participants)
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