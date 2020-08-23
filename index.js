const express = require('express')
const socketIO = require('socket.io')
const http = require('http')
const bodyParser = require('body-parser')
const cors = require('cors')

const port = 3001
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
//app.use(cors())
app.use(express.static('build'))

const server = http.createServer(app)
const io = socketIO(server)

let ID = []

io.on('connection', (socket) => {
  console.log('New user connected!')

  ID.push(socket.id)

  socket.emit('myID', socket.id)

  socket.on('call', ({to,from, signal}) => {
    if(ID.find(id => id==to)){
      io.to(to).emit('rang', {signal, from})
    } else {
      socket.emit('notFound',to)
    }
  })

  socket.on('accept', ({to, signal}) => {
    io.to(to).emit('callAccepted', signal)
  })

  socket.on('decline', ({to, from}) => {
    io.to(to).emit('callDeclined', from)
  })

  socket.on('end', ({to, from}) => {
    io.to(from).emit('endCall', to)
    io.to(to).emit('endCall', from)
  })

  socket.on('busy', ({to, from}) => {
    io.to(to).emit('busy', from)
  })

  //**Message */
  socket.on('send', ({from, to, message}) => {
    io.to(to).emit('message', {from, message})
  })

  socket.on('emotion', ({to, icon}) => {
    io.to(to).emit('emotion', icon)
  })
})



server.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
