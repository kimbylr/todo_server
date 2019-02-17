const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const jsonParser = require('body-parser').json;

const secret = require('./secret');
const routes = require('./routes');

const db = require('./db');

const app = express();
const port = process.env.PORT || 3030;

app.listen(port, () =>
  console.log(`${Date()}
Listening on port ${port}.`),
);

app.use(cors()); // permits all requests
app.enable('trust proxy'); // trusts the heroku proxy and saves origin ip in req.ip

app.use(logger('dev'));
app.use(jsonParser());

app.use('/todo', secret);
app.use('/todo', routes);

// catch 404
app.use((req, res, next) => {
  const err = new Error('Not found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
    },
  });
});
