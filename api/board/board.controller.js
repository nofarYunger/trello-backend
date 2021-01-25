const boardService = require("./board.service");
const logger = require("../../services/logger.service");
// const {emit} = require('../../services/socket.service')
const io = require("socket.io-client");
const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://chello-app.herokuapp.com/"
    : "http://localhost:3031";
const socket = io.connect(baseUrl, { secure: true });

const gGuest = {
  username: "Guest",
  fullname: "Guest",
  imgUrl:
    "https://res.cloudinary.com/nofar/image/upload/v1611336021/psvaqtmh8ithfqe8ah27.png",
  _id: "60055b8847b3113210b3df83",
};

async function getBoards(req, res) {
  try {
    const boards = await boardService.query();
    res.send(boards);
  } catch (err) {
    logger.error("Failed to get boards", err);
    res.status(500).send({ err: "Failed to get boards" });
  }
}

async function getBoard(req, res) {
  try {
    const boardId = req.params.id;
    const board = await boardService.getBoard(boardId);
    res.send(board[0]);
  } catch (err) {
    logger.error(`Failed to get board : ${boardId}`, err);
    res.status(500).send({ err: `Failed to get board : ${boardId}` });
  }
}

async function deleteBoard(req, res) {
  try {
    await boardService.remove(req.params.id);
    res.send({ msg: "Deleted successfully" });
  } catch (err) {
    logger.error("Failed to delete board", err);
    res.status(500).send({ err: "Failed to delete board" });
  }
}

async function addBoard(req, res) {
  try {
    const loggedinUser = req.session.loggedinUser || gGuest;
    const board = req.body;
    const boardToAdd = await boardService.add(board, loggedinUser);
    res.send(boardToAdd);
  } catch (err) {
    logger.error("Failed to add board", err);
    res.status(500).send({ err: "Failed to add board" });
  }
}

async function updateBoard(req, res) {
  try {
    const { board, activity } = req.body;
    const loggedinUser = req.session.loggedinUser || gGuest;
    const { updatedBoard, newActivity } = await boardService.update({
      board,
      activity,
      loggedinUser,
    });
    socket.emit("board updated", { updatedBoard, newActivity });
    res.send(updatedBoard);
  } catch (err) {
    logger.error("Failed to update board", err);
    res.status(500).send({ err: "Failed to update board" });
  }
}

module.exports = {
  addBoard,
  updateBoard,
  deleteBoard,
  getBoards,
  getBoard,
};
