const express = require('express');
const router = express.Router();

require('dotenv').config();
const secret = process.env.FRONTEND_PASSPHRASE;

// very basic security is enough in this case
router.use((req, res, next) => {
  // console.log('authstring: ' + req.headers.authorization);
  if (secret === req.headers.authorization) {
    console.log('secret stimmt überein');
    next();
  } else {
    console.log('secret stimmt nicht überein');
    const err = new Error('No permission');
    err.status = 401;
    next(err);
  }
});

module.exports = router;
