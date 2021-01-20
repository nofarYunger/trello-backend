const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');
const ObjectId = require('mongodb').ObjectId


var gIo = null
var gSocketBySessionIdMap = {}
function emit({ type, data }) {
    gIo.emit(type, data);
}


function connectSockets(http, session) {
    gIo = require('socket.io')(http, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ["GET", "POST", "PUT", "DELETE"],
            allowedHeaders: ["my-custom-header"],
            credentials: true
        }
    });

    const sharedSession = require('express-socket.io-session');

    gIo.use(sharedSession(session, {
        autoSave: true
    }));
    gIo.on('connection', socket => {
        gSocketBySessionIdMap[socket.handshake.sessionID] = socket
        socket.on('member connected', ({ userId, boardId }) => {
            if (socket.currBoard) {
                socket.leave(socket.currBoard)
            }
            socket.join(boardId)
            console.log('socket.boardId', socket.handshake.sessionID);

            socket.currBoard = boardId
        })
        socket.on('do notification', notification => {

            socket.to(socket.currBoard).emit('do notification fs', notification)
        })

        socket.on('board updated', (updatedBoard) => {
            console.log('gIo: ', gIo);
            socket.to(socket.currBoard).emit('board updated fs', updatedBoard)
        })

        socket.on('task updated', activityTxt => {
            console.log('activityTxt: ', activityTxt);
            socket.to(socket.currBoard).emit('task updated fs', activityTxt)
        })

        socket.on('member joined task', taskId => {
            socket.join(taskId)

        })

        socket.on('member left task', taskId => {
            socket.leave(taskId)
        })

        socket.on('do notification', notification => {
            console.log('notification: ', notification);
            socket.to(socket.currBoard).emit('do notification fs', notification)
        })
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
            if (socket.handshake) {
                gSocketBySessionIdMap[socket.handshake.sessionID] = null
            }
        })

        // socket.on('member added', ({ _id }) => {
        //     socket.to(socket.currBoard).emit('member added fs', { userId: _id })
        // })

        socket.on('chat topic', topic => { //topic =toy._id
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
            }
            socket.join(topic)
            // logger.debug('Session ID is', socket.handshake.sessionID)
            socket.myTopic = topic
        })
        socket.on('chat newMsg', msg => {
            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // emits only to sockets in the same room
            console.log('msg:', msg);
            gIo.to(socket.myTopic).emit('chat addMsg', msg)
            // save to data:
        })
        socket.on('is typing', username => {
            console.log('user is typing:', username);
            // gIo.to(socket.myTopic).emit('broadcast','user is typing', username)
            socket.to(socket.myTopic).emit('user is typing', username)

            // socket.broadcast.to(room2').emit('message', 'nice game');

        })

    })
}

// Send to all sockets BUT not the current socket 
function broadcast({ type, data }) {
    const store = asyncLocalStorage.getStore()
    const { sessionId } = store
    if (!sessionId) return logger.debug('Shoudnt happen, no sessionId in asyncLocalStorage store')
    const excludedSocket = gSocketBySessionIdMap[sessionId]
    if (!excludedSocket) return logger.debug('Shouldnt happen, No socket in map', gSocketBySessionIdMap)
    excludedSocket.broadcast.emit(type, data)
}

module.exports = {
    connectSockets,
    emit,
    broadcast
}



