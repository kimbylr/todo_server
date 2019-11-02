const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const jsonParser = require('body-parser').json;
const http = require('http');
const WebSocketServer = require('ws').Server;

const secret = require('./secret');
const routes = require('./routes');

require('./db');
const app = express();

const PORT = process.env.PORT || 3030;
const WS_PORT = process.env.WS_PORT || 8999;

app.listen(PORT, () => console.log(`${Date()}\nListening on port ${PORT}.`));

app.use(cors()); // permits all requests
app.enable('trust proxy'); // trusts the heroku proxy and saves origin ip in req.ip

app.use(logger('dev'));
app.use(jsonParser());

// store active WebSockets
let connections = [];
app.use((req, res, next) => {
  req.connections = connections;
  return next();
});

// handle WebSockets
const httpServer = http.createServer(app);
const wsServer = new WebSocketServer({ server: httpServer });
wsServer.on('connection', ws => {
  connections = [...connections, ws];
  ws.on('close', () => {
    connections = connections.filter(c => c !== ws);
  });
  console.log('client opened WebSocket');
  ws.send('connection succeeded');
});
httpServer.listen(WS_PORT, () => {
  console.log(`WebSocket server running on port ${httpServer.address().port}.`);
});

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
