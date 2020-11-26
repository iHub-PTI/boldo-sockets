import 'dotenv/config'

import http from 'http'
import socketIO from 'socket.io'

const DEBUG = true

const server = http.createServer()
const io = socketIO(server)

io.origins('*:*')

io.use((_, next) => debugClients('BEFORE:', next))

io.on('connection', socket => {
  debugClients('AFTER :')

  if (DEBUG)
    socket.use((packet, next) => {
      console.log(`\n\n<<<<< #################  ${socket.id}  ################# >>>>>\n`, packet)
      next()
    })

  socket.on('disconnecting', () => {
    //TODO: validate doctor / patient
    let rooms = Object.keys(socket.rooms)

    rooms.forEach(e => {
      socket.to(e).emit('peer not ready', e)
    })

    if (DEBUG) console.log('disconnecting', socket.id)
  })

  //
  // PING: Show Ready Patients
  //

  socket.on('find patients', (rooms: string[]) => {
    rooms.forEach(room => {
      socket.join(room)
      socket.to(room).emit('find patient')
    })
  })

  socket.on('patient ready', room => {
    socket.join(room)
    socket.to(room).emit('patient ready', room)
  })

  // FIXME: Can this be removed?
  // remove the patient from the appointment room
  socket.on('peer not ready', room => {
    socket.leave(room)
    socket.to(room).emit('peer not ready', room)
  })

  // Once a call starts, signal patient as not ready
  // Patient stays in room for WebRTC Signaling
  socket.on('patient in call', room => socket.to(room).emit('peer not ready', room))

  // Begin a Call
  socket.on('ready?', room => {
    socket.join(room)
    socket.to(room).emit('ready?', room)
  })
  socket.on('ready!', room => {
    socket.join(room)
    socket.to(room).emit('ready!', room)
  })

  // End a call
  socket.on('end call', room => socket.to(room).emit('end call', room))

  //
  // WebRTC Signaling
  //

  socket.on('sdp offer', message => {
    socket.join(message.room)
    socket.to(message.room).emit('sdp offer', { ...message })
  })

  socket.on('ice candidate', message => {
    socket.to(message.room).emit('ice candidate', { ...message })
  })
})

const port = process.env.PORT || 8000
server.listen(port, () => console.log(`server is running on port ${port}`))

const debugClients = (msg: string, next?: () => void) => {
  if (!DEBUG) return next?.()

  io.clients((error: any, clients: any) => console.log(msg, clients))
  next?.()
}
