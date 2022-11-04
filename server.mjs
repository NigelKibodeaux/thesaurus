import { WebSocketServer } from 'ws'
import http from 'http'
import fs from 'fs'


const server = http.createServer((req, res) => {
  const client = fs.readFileSync('client.html', 'utf8')
  res.write(client)
  res.end()
})

server.listen((process.env.PORT || 8080), () => {
  console.log("Server is Running on port", process.env.PORT || 8080)
})

const wss = new WebSocketServer({ server, clientTracking: true })

const players = new Map()

wss.on('connection', function connection(ws, req) {
  const playerId = new URL('https://whatever/' + req.url).searchParams.get('player')
  console.log('connection established')
  console.log('clients:', wss.clients.size)
  players.set(playerId, {ws})

  ws.on('message', function message(data) {
    const { guess, handle } = JSON.parse(data)
    console.log('playerId', playerId, { guess, handle })
    if (handle) {
      const existingHandle = players.get(playerId).handle
      if (!existingHandle) players.set(playerId, {handle, ws})
    }

    broadcastGuess(playerId, guess, handle)
  })
})

wss.on('error', console.log)

function broadcastGuess(playerId, guess, handle) {
  players.forEach((player, id) => {
    if (id !== playerId) {
      player.ws.send(JSON.stringify({ playerId, handle, guess }))
    }
  })
}
