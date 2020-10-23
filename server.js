const express = require('express')
const http = require('http')

const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)

io.origins('*:*')

let rooms = {}
let doctorsListening = []
app.use(express.json())

io.on('connection', socket => {
  socket.on('addDoctorListening', () => {
    doctorsListening.push(socket.id)
    io.to(socket.id).emit('waitingRooms', rooms)
  })

  socket.on('end_call', () => {
    for (room in rooms) {
      const foundIndex = rooms[room].findIndex(element => element == socket.id)
      if (foundIndex != -1) {
        rooms[room].splice(foundIndex, 1)
        io.to(rooms[room][0]).emit('end_call')
        delete rooms[room];
        for (let doctorListening of doctorsListening) {
          io.to(doctorListening).emit('waitingRooms', rooms)
        }
        break
      }
    }
  })

  socket.on('start call', roomID => {
    if (rooms[roomID]) {
      rooms[roomID].push(socket.id)
      if (rooms[roomID].length > 2) {
        rooms[roomID] = []
        rooms[roomID].push(socket.id)
      } else if (rooms[roomID].length > 1) {
        let hostID = rooms[roomID][0]
        let partnerID = rooms[roomID][1]

        io.to(hostID).emit('call partner', partnerID)
        io.to(partnerID).emit('call host', hostID)
      }
    } else {
      rooms[roomID] = [socket.id]
      for (let doctorListening of doctorsListening) {
        io.to(doctorListening).emit('waitingRooms', rooms)
      }
    }
  })
  socket.on('offer', payload => {
    io.to(payload.target).emit('offer', payload)
  })

  socket.on('answer', payload => {
    io.to(payload.target).emit('answer', payload)
  })

  socket.on('ice-candidate', incoming => {
    io.to(incoming.target).emit('ice-candidate', incoming.candidate)
  })
})

const port = process.env.PORT || 8000
server.listen(port, () => console.log(`server is running on port ${port}`))
