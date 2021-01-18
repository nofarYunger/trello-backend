const express = require('express')
const router = express.Router()
const { getBoards, addBoard, updateBoard, getBoard, deleteBoard } = require('./board.controller')

router.get('/', getBoards)
router.get('/:id', getBoard)
router.post('/', addBoard)
router.put('/:id', updateBoard)
router.delete('/:id', deleteBoard)


module.exports = router