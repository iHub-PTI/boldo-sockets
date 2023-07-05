import jwt from 'jsonwebtoken'

import { io } from '../server'

export const verify = (token: string, subject?: string) => {
  // FIXME: Remove Cheat
  if (token === 'superPenguinMagic') return { ids: ['superPenguinMagic'] }

  try {
    return jwt.verify(token, process.env.PUBLIC_KEY!, {
      audience: 'boldo-sockets',
      issuer: 'boldo-server',
      ...(subject && { subject }),
    }) as { ids: string[] }
  } catch (err) {
    throw err
  }
}

export const verifyRoomAccess = (room: string, socket: SocketIO.Socket, tokenIds: string[]) => {
  // FIXME: Remove Cheat
  if (tokenIds.includes('superPenguinMagic')) return socket.join(room)

  return new Promise<void>((resolve, reject) => {
    io.in(room).clients((error: Error, clients: string[]) => {
      if (clients.includes(socket.id)) {
        // console.log(`OK ${room} for ${socket.id}`)
        return resolve()
      }
      if (tokenIds.includes(room)) {
        socket.join(room)
        console.log(`✅ ${socket.id} ADDED TO ${room}`)
        return resolve()
      }
      reject(`${socket.id} not granted access to ${room}`)
    })
  })
}
