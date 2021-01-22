
const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const bcrypt = require('bcrypt')
const ObjectId = require('mongodb').ObjectId
module.exports = {
    login,
    signup,
    query,
    getById
}



async function login({ username, password }) {
    logger.debug(`auth.service - login with username: ${username}`)

    const user = await getByUsername(username)
    if (!user) return Promise.reject('Invalid username')

    const match = await bcrypt.compare(password, user.password)
    if (!match) return Promise.reject('Invalid  password')

    delete user.password

    return user
}



async function signup({ username, password, fullname, imgUrl }) {
    const saltRounds = 10

    if (!username || !password || !fullname) return Promise.reject('fullname, username and password are required!')
    logger.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)

    const hash = await bcrypt.hash(password, saltRounds)
    const userToReturn = _addToData({ username, password: hash, fullname, imgUrl })
    delete userToReturn.password
    return userToReturn
}


// gets all the users 
async function query(filterBy) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('user')
        var users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}


// get spesific user by id 
async function getById(userId) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ '_id': ObjectId(userId) })
        delete user.password
        return user
    } catch (err) {
        logger.error(`while finding user ${userId}`, err)
        throw err
    }
}


async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`while finding user ${username}`, err)
        throw err
    }
}




// bulid mongos filter-obj
function _buildCriteria(filterBy) {
    const criteria = {}

    if (filterBy) {
        const txtCriteria = { $regex: filterBy, $options: 'i' }
        criteria.$or = [
            { username: txtCriteria },
            { fullname: txtCriteria }
        ]
    }
    return criteria
} 



async function _addToData(user) {
    try {
        // peek only updatable fields!
        const userToAdd = {
            username: user.username,
            password: user.password,
            fullname: user.fullname,
            imgUrl: user.imgUrl,
            isAdmin: false
        }
        const collection = await dbService.getCollection('user')
        await collection.insertOne(userToAdd)
        return userToAdd
    } catch (err) {
        logger.error('cannot insert user', err)
        throw err
    }
}
