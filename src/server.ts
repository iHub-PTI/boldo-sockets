import 'dotenv/config';
//import logger from "./util/logger";

require('elastic-apm-node').start({
  serviceName: 'boldo-socket',
  secretToken: process.env.APM_SERVER_SECRET,
  serverUrl: process.env.APM_SERVER_URL,
  environment: process.env.APM_SERVER_ENVIRONMENT
});

import http from 'http'
import socketIO from 'socket.io'

import { debugClients, debugDisconnect, debugPayload } from './util/debug'
import { verify, verifyRoomAccess } from './util/helpers'

type roomAndToken = { room: string; token: string }

const server = http.createServer()
export const io = socketIO(server)

io.origins('*:*')

io.use((_, next) => debugClients('BEFORE:', next))

io.on('connection', socket => {
  debugClients('AFTER :')
  debugPayload(socket)
  console.log(JSON.stringify({ event: 'connection', rooms: socket.rooms }));
  socket.on('disconnecting', () => {
    console.log({ event: 'disconnection', rooms: socket.rooms });
    let rooms = Object.keys(socket.rooms)
    rooms.forEach(e => socket.to(e).emit('peer not ready', e))
    debugDisconnect(socket)
  })

  //
  // PING: Show Ready Patients
  //

  socket.on('find patients', async ({ rooms, token }: { rooms: string[]; token: string }) => {
    try {
      const veritas = verify(token, 'doctor')
      console.log(JSON.stringify({ event: 'find patients', rooms, token: veritas }));
      for (const room of rooms) {
        await verifyRoomAccess(room, socket, veritas.ids)

        socket.to(room).emit('find patient')
      }
    } catch (err) {
      console.log(err)
    }
  })

  socket.on('patient ready', async ({ room, token }: roomAndToken) => {
    try {
      const ver = verify(token, 'patient')
      console.log({ event: 'patient ready', room, token: ver });
      await verifyRoomAccess(room, socket, ver.ids)

      socket.to(room).emit('patient ready', room)
    } catch (err) {
      console.log(err)
    }
  })

  // Once a call starts, signal patient as not ready
  // Patient stays in room for WebRTC Signaling
  socket.on('patient in call', async ({ room, token }: roomAndToken) => {
    try {
      const ver = verify(token, 'patient');
      console.log({ event: 'patient in call', room, token: ver });
      await verifyRoomAccess(room, socket, ver.ids);
      socket.to(room).emit('peer not ready', room)
    } catch (err) {
      console.log(err)
    }
  })

  // Begin a Call
  socket.on('ready?', async ({ room, token }: roomAndToken) => {
    try {
      const veritas = verify(token, 'doctor');
      console.log({ event: 'ready?', room, token: veritas });
      await verifyRoomAccess(room, socket, veritas.ids);
      socket.to(room).emit('ready?', room)
    } catch (err) {
      console.log(err)
    }
  })

  socket.on('ready!', async ({ room, token }: roomAndToken) => {
    try {
      const veritas = verify(token, 'patient');
      console.log({ event: 'ready!', room, token: veritas });
      await verifyRoomAccess(room, socket, veritas.ids);
      socket.to(room).emit('ready!', room)
    } catch (err) {
      console.log(err)
    }
  })

  // End a call
  socket.on('end call', async ({ room, token }: roomAndToken) => {
    try {
      const veritas = verify(token);
      console.log({ event: 'end call', room, token: veritas });
      await verifyRoomAccess(room, socket, veritas.ids);
      socket.to(room).emit('end call', room);
    } catch (err) {
      console.log(err)
    }
  })

  //
  // WebRTC Signaling
  //

  socket.on('sdp offer', async message => {
    const { token, ...payload } = message
    try {
      const veritas = verify(token);
      console.log({ event: 'sdp offer', room: payload.room, token: veritas });
      await verifyRoomAccess(payload.room, socket, veritas.ids);
      socket.to(payload.room).emit('sdp offer', { ...payload })
    } 
    catch (err) {
      console.log(err);
    }
  })

  socket.on('ice candidate', async message => {
    const { token, ...payload } = message
    try {
      const veritas = verify(token);
      console.log({ event: 'ice candidate', room: payload.room, token: veritas });
      await verifyRoomAccess(payload.room, socket, veritas.ids);
      socket.to(payload.room).emit('ice candidate', { ...payload })
    } 
    catch (err) {
      console.log(err)
    }
  })
})

const port = process.env.PORT || 8000
server.listen(port, () => console.log(`server is running on port ${port}`))
