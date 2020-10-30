const express = require('express')
const http = require('http')

const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)

io.origins('*:*')

app.use(express.json())

io.on('connection', socket => {
  socket.on('disconnecting', () => {
    //TODO: validate doctor / patient
    let rooms = Object.keys(socket.rooms)

    rooms.forEach(e => {
      socket.to(e).emit('peer not ready', e)
    })
  })

  socket.on('find patients', appointments => {
    //TODO: validate doctor
    //for every appointment join the room and emit an event.
    appointments.forEach(appointmentId => {
      socket.join(appointmentId, err => {
        if (err) return console.log(err)
        socket.to(appointmentId).emit('find patient')
      })
    })
  })

  socket.on('patient ready', appointmentId => {
    //TODO: validate patient
    //add the patient to the appointment room.
    socket.join(appointmentId, err => {
      if (err) return console.log(err)
      socket.to(appointmentId).emit('patient ready', appointmentId)
    })
  })

  socket.on('peer not ready', appointmentId => {
    //TODO: validate patient
    //remove the patient from the appointment room.
    //broadcast peer not ready towards the doctor

    socket.leave(appointmentId, err => {
      if (err) return console.log(err)
      socket.to(appointmentId).emit('peer not ready', appointmentId)
    })
  })

  socket.on('patient in call', appointmentId => {
    //TODO: validate patient
    //broadcast peer not ready towards the doctor

    socket.to(appointmentId).emit('peer not ready', appointmentId)
  })

  socket.on('end call', appointmentId => {
    //TODO: validate patient/doctor
    socket.to(appointmentId).emit('end call', appointmentId)
  })

  socket.on('start call', appointmentId => {
    //TODO: validate patient/doctor
    socket.to(appointmentId).emit('call partner', appointmentId)
  })
  socket.on('offer', payload => {
    //TODO: validate patient/doctor
    socket.to(payload.appointmentId).emit('offer', payload)
  })

  socket.on('answer', payload => {
    //TODO: validate patient/doctor
    socket.to(payload.appointmentId).emit('answer', payload)
  })

  socket.on('ice-candidate', payload => {
    //TODO: validate patient/doctor
    socket.to(payload.appointmentId).emit('ice-candidate', payload.candidate)
  })
})

const port = process.env.PORT || 8000
server.listen(port, () => console.log(`server is running on port ${port}`))
