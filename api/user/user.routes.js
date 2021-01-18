const express = require('express')

const { login, signup, logout, getUsers ,getUser} = require('./user.controller')
const router = express.Router()


router.post('/login', login)
router.post('/signup', signup)
router.post('/logout', logout)
router.get('/', getUsers)
router.get('/:id', getUser)


module.exports = router