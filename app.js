const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => console.log(`server on port ${PORT}`))

const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname, 'public')))

let socketsConnected = new Set()

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id)

  socket.on('authenticate', (data) => {
    if (!data.username || data.username.trim() === '') {
      socket.emit('error', { message: 'Invalid username.' })
      socket.disconnect()
      return
    }

    socket.username = data.username
    socketsConnected.add(socket.id)
    io.emit('clients-total', socketsConnected.size)
    io.emit('user-connected', { username: socket.username })

    console.log(`User authenticated: ${data.username}`)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id)
    socketsConnected.delete(socket.id)
    io.emit('clients-total', socketsConnected.size)
    if (socket.username) {
      io.emit('user-disconnected', { username: socket.username })
    }
  })

  socket.on('message', (data) => {
    socket.broadcast.emit('chat-message', data)
  })

  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback', data)
  })
})
