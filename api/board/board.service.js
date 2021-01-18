const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const cloneDeep = require('lodash')



async function query() {
    try {
        const collection = await dbService.getCollection('board')
        var boards = await collection.find({}).toArray()
        console.log('boards:', boards);
        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }
}

async function getBoard(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        const query = { _id: ObjectId(boardId) }
        const board = await collection.find(query).toArray()
        console.log('boardddd:', board);
        return board
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }
}

async function remove(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        const query = { _id: ObjectId(boardId) }
        await collection.deleteOne(query)
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}

async function update(board, loggedinUser, activity) {
    try {

        let boardToAdd = cloneDeep(board)
        boardToAdd = _addActivities(boardToAdd, loggedinUser,activity)

        console.log('updating at the service:', boardToAdd);

        const query = { _id: ObjectId(board._id) } //translating the id from the params to mongo lang
        const collection = await dbService.getCollection('board')
        await collection.updateOne(query, { $set: boardToAdd })

        console.log("wrong insertion")
        return boardToAdd

    } catch (err) {
        logger.error(`cannot update board ${board._id}`, err)
        throw err
    }
}


function _addActivities(boardToAdd, loggedinUser, activity) {

    const newActivity = {
        ...activity,//(txt, task...)
        id: _makeId(),
        createdAt: Date.now(),
        byMember: loggedinUser
    }
    boardToAdd.activities.unShift(newActivity)
    return boardToAdd
}



async function add(board, loggedinUser) {
    try {
        console.log("Im adding..",board);
        const collection = await dbService.getCollection('board')
        let boardToAdd = _insertDefault(board, loggedinUser)
        let res = await collection.insertOne(boardToAdd)
        return res.ops[0]
    } catch {
        logger.error('cannot add board to data', err)
        throw err
    }
}




module.exports = {
    query,
    getBoard,
    remove,
    add,
    update
}




function _insertDefault(board, loggedinUser) {

    return {
        ...board,
        createdAt: Date.now(),
        createdBy: {
            username:loggedinUser.username,
            _id:loggedinUser._id,
            fullname:loggedinUser.fullname,
            imgUrl:loggedinUser.imgUrl,
        },
        lists: [
            {
                id: _makeId(),
                title: 'To Do',
                style: {
                    title: {
                        bgColor: '#9895e0'
                    },
                    bgColor: '#9895e082'
                }

            },
            {
                id: _makeId(),
                title: 'Doing',
                style: {
                    title: {
                      bgColor: '#4a94f8'
                    },
                    bgColor: '#4a94f882'
                }
            },
            {
                id: _makeId(),
                title: 'Done',
                style: {
                    title: {
                      bgColor: '#56c991'
                    },
                    bgColor: '#56c99182'
                  }

            }
        ]
    }
}


function _makeId(length = 5) {
    var txt = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return txt;
}
