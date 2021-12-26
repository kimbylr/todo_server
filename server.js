const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const jsonParser = require('body-parser').json;

const secret = require('./secret');
const routes = require('./routes');

require('./db');
const app = express();
const PORT = process.env.PORT || 3030;

app.listen(PORT, () => console.log(`${Date()}\nListening on port ${PORT}.`));

app.use(cors({ origin: process.env.CORS_ORIGIN }));

app.use(logger('dev'));
app.use(jsonParser());

// handle routes
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
