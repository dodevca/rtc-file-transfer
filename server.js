// modules
const express   = require('express')
const ejsLayout = require('express-ejs-layouts')
const http      = require('http')
const socketIo  = require('socket.io')
const redis     = require('redis')
const path      = require('path')

// engine setup
require('dotenv').config()

const app           = express()
const server        = http.createServer(app)
const io            = socketIo(server)
const port          = process.env.PORT
const homeRouter    = require('./routes/home')
const userRouter    = require('./routes/user')
const apiRouter     = require('./routes/api')

app.set('view engine', 'ejs')
app.set('layout', 'layouts/appContentFull')
app.use(ejsLayout)
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// routes
app.use('/', homeRouter)
app.use('/user', userRouter)
app.use('/api', apiRouter)

// websocket
io.on('connection', (socket) => {
    socket.on('join-room', async(code) => {
        const client = redis.createClient()

        await client.connect()

        const exists = await client.exists(code)

        if(exists) {
            socket.join(code)
            socket.emit('room-joined', { success: true, message: 'Code is valid' })
        } else {
            socket.emit('room-joined', { success: false, message: 'Invalid or expired code' })
        }
    })

    socket.on('file-info', async(data) => {
        const client = redis.createClient()
        
        await client.connect()

        const exists = await client.exists(data.code)

        if(exists) {
            io.to(data.code).emit('file-info', data)
        } else {
            socket.emit('error', { message: 'Invalid or expired code' })
        }
    })

    socket.on('file-chunk', (data) => {
        socket.to(data.code).emit('file-chunk', data)
    })

    socket.on('file-chunk-received', (data) => {
        socket.to(data.code).emit('file-chunk-received', data)
    })

    socket.on('receiver-ready', (code) => {
        socket.to(code).emit('receiver-ready')
    })

    socket.on('receiver-complete', async(code) => {
        const client = redis.createClient()
        
        await client.connect()
        
        const exists = await client.exists(data.code)

        if(exists)
            await client.del(code)

        socket.to(code).emit('receiver-complete')
    })
})

// server run
server.listen(port, () => {
    console.log('Satset is running on port: ' + port)
})

module.exports = app