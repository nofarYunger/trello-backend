const userService = require('./user.service')
const logger = require('../../services/logger.service')


// LOGIN
async function login(req, res) {
    const { password, username } = req.query // credentials strucutre: {username: '', password: ''}
    console.log('password:', password);
    console.log('username:', username);
    try {
        const user = await userService.login({ password, username })//checking if the cred are true
        //if we found a user:
        user.loggedinAt = Date.now()
        req.session.loggedinUser = user //saved in an orange balloon (cookie session)
        res.send(user)

    } catch {//if the request failed:
        res.status(401).send('Invalid username/password')
        // throw err
    }
}


// SIGNUP
async function signup(req, res) {
    const credentials = req.body  // credentials strucutre: {username: '', password: '', fullname: ''}
    try {
        const user = await userService.signup(credentials)//checking if the cred are free and saving it to the db
        //if we found a user:
        user.loggedinAt = Date.now()
        req.session.loggedinUser = user //saved in an orange balloon (cookie session
        res.send(user)

    } catch {//if the request failed:
        res.status(401).send('Invalid username/password')
    }
}



// LOGOUT
async function logout(req, res) {
    try {
        req.session.destroy()
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(500).send({ err: 'Failed to logout' })
    }
}


async function getUsers(req, res) {
    const filterBy = req.query?.txt || ''
    try {
        const users = await userService.query(filterBy)
        res.send(users)
    } catch (err) {
        logger.error('Failed to get users', err)
        res.status(500).send({ err: 'Failed to get users' })
    }
}

async function getUser(req, res) {
    try {
        const user = await userService.getById(req.params.id)
        res.send(user)
    } catch (err) {
        logger.error('Failed to get user', err)
        res.status(500).send({ err: 'Failed to get user' })
    }
}


module.exports = {
    login,
    signup,
    logout,
    getUsers,
    getUser

}
