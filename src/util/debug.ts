import { io } from '../server'

const DEBUG = process.env.VERBOSE === 'true'

export const debugClients = (msg: string, next?: () => void) => {
  if (!DEBUG) return next?.()

  io.clients((error: any, clients: any) => console.log(msg, clients))
  next?.()
}

export const debugPayload = (socket: SocketIO.Socket) => {
  if (!DEBUG) return

  socket.use((packet, next) => {
    let payload
    if (packet[1].token) {
      const { token, ...pl } = packet[1]
      payload = pl
    } else payload = packet[1]

    console.log(`\n\n<<<<< #################  ${socket.id}  ################# >>>>>\n`, { event: packet[0] }, '\n', {
      payload,
    })

    debugRooms()

    next()
  })
}

export const debugRooms = () => {
  if (!DEBUG) return

  console.log('\nROOMS:')
  let rooms = Object.keys(io.sockets.adapter.rooms)
  rooms.forEach(room => {
    const participants = Object.keys(io.sockets.adapter.rooms[room].sockets)
    console.log(room, participants)
    //   Object.keys(room.sockets)
  })
  console.log('\n')
}

export const debugDisconnect = (socket: SocketIO.Socket) => {
  if (!DEBUG) return
  console.log('disconnecting', socket.id)
}
