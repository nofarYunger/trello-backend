const logger = require('../services/logger.service')

async function log(req, res, next) {
  if (req.session && req.session.loggedinUser) {
    logger.info('Req from: ' + req.session.loggedinUser.fullname)
  }
  next()
}

module.exports = {
  log
}
